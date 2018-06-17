#!/usr/bin/env node

'use strict';

const cp = require('child_process');
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const streamSplitter = require('stream-splitter');
const fs = require('fs');
const del = require('del');

chai.use(require('chai-json'));

const simCmd = path.join(__dirname, '../node_modules/.bin/hue-simulator');
const simArgs = ['--hostname=0.0.0.0', '--port=9000'];

let sim;
let simPipeOut;
let simPipeErr;
const simSubscriptions = {};
const simBuffer = [];

const myAppCmd = path.join(__dirname, '../index.js');
const myAppArgs = ['--config-file', 'test/config.json'];

let myApp;
let myAppPipeOut;
let myAppPipeErr;
const hueSubscriptions = {};
const hueBuffer = [];

let subIndex = 0;

function subscribe(type, rx, cb) {
    subIndex += 1;
    if (type === 'sim') {
        simSubscriptions[subIndex] = {rx, cb};
    } else if (type === 'myApp') {
        hueSubscriptions[subIndex] = {rx, cb};
    }
    matchSubscriptions(type);
    return subIndex;
}

// function unsubscribe(type, subIndex) {
//     if (type === 'sim') {
//         delete simSubscriptions[subIndex];
//     } else if (type === 'myApp') {
//         delete hueSubscriptions[subIndex];
//     }
// }

function matchSubscriptions(type, data) {
    let subs;
    let buf;
    if (type === 'sim') {
        subs = simSubscriptions;
        buf = simBuffer;
    } else if (type === 'myApp') {
        subs = hueSubscriptions;
        buf = hueBuffer;
    }
    if (data) {
        buf.push(data);
    }
    buf.forEach((line, index) => {
        Object.keys(subs).forEach(key => {
            const sub = subs[key];
            if (line.match(sub.rx)) {
                sub.cb(line);
                delete subs[key];
                buf.splice(index, 1);
            }
        });
    });
}

function startSim() {
    sim = cp.spawn(simCmd, simArgs);
    simPipeOut = sim.stdout.pipe(streamSplitter('\n'));
    simPipeErr = sim.stderr.pipe(streamSplitter('\n'));
    simPipeOut.on('token', data => {
        console.log('sim', data.toString());
        matchSubscriptions('sim', data.toString());
    });
    simPipeErr.on('token', data => {
        console.log('sim', data.toString());
        matchSubscriptions('sim', data.toString());
    });
}

function runMyApp(cmd = 'backup', extra_args = []) {
    var args = [cmd].concat(myAppArgs, extra_args);
    myApp = cp.spawn(myAppCmd, args);
    myAppPipeOut = myApp.stdout.pipe(streamSplitter('\n'));
    myAppPipeErr = myApp.stderr.pipe(streamSplitter('\n'));
    myAppPipeOut.on('token', data => {
        console.log('myApp', data.toString());
        matchSubscriptions('myApp', data.toString());
    });
    myAppPipeErr.on('token', data => {
        console.log('myApp', data.toString());
        matchSubscriptions('myApp', data.toString());
    });
}

function end(code) {
    if (myApp.kill) {
        myApp.kill();
    }
    if (sim.kill) {
        sim.kill();
    }
    if (typeof code !== 'undefined') {
        process.exit(code);
    }
}

process.on('SIGINT', () => {
    end(1);
});

process.on('exit', () => {
    end();
});

describe('start hue-simulator', () => {
    
    before('cleanup', function() {
        del.sync(path.join(__dirname, '../newdeveloper'));
    });
    
    it('hue-simulator should start without error', function (done)  {
        this.timeout(20000);
        subscribe('sim', /hue simulator listening/, data => {
            done();
        });
        startSim();
    });
});

describe('backup endpoints from config file', () => {
    
    it('last endpoint saved', function (done) {
        this.timeout(20000);
        subscribe('myApp', /saved .\/newdeveloper\/schedules.json/, data => {
            done();
        });
        runMyApp();
    });
    
    it('expect a json file for each endpoint', function() {
        fs.readdirSync(path.join(__dirname, '../newdeveloper')).forEach(file => {
            console.log('checking ' + file);
            expect('./newdeveloper/' + file).to.be.a.jsonFile();
        });
    });
});

describe('backup with invalid backup dir', () => {
    it('log error and exit', function (done) {
        this.timeout(20000);
        subscribe('myApp', /ENOENT/, data => {
            done();
        });
        runMyApp('backup', ['-d', '/tmp/1/2/3/4']);
    });
});

describe('backup with invalid endpoint', () => {
    it('log error and exit', function (done) {
        this.timeout(20000);
        subscribe('myApp', /Invalid values/, data => {
            done();
        });
        runMyApp('backup', ['-e', 'badendpoint']);
    });
});

describe('backup with non-listening port', () => { 
    it('log error and exit', function (done) {
        this.timeout(20000);    // 20 seconds
        subscribe('myApp', /ECONNREFUSED/, data => {
            done();
        });
        runMyApp('backup', ['-b', '0.0.0.0:9999', '-e', 'config']);
    });
});

describe('restore config', () => { 
    it('simulator will return success', function (done) {
        this.timeout(20000);    // 20 seconds
        subscribe('myApp', /success: /, data => {
            done();
        });
        runMyApp('restore', ['-e', 'config']);
    });
});

describe('restore lights', () => { 
    it('simulator will reject PUT', function (done) {
        this.timeout(20000);    // 20 seconds
        subscribe('myApp', /Cannot PUT \/api\/newdeveloper\/lights/, data => {
            done();
        });
        runMyApp('restore', ['-e', 'lights']);
    });
});

describe('restore groups', () => { 
    it('simulator will reject PUT', function (done) {
        this.timeout(20000);    // 20 seconds
        subscribe('myApp', /Cannot PUT \/api\/newdeveloper\/groups/, data => {
            done();
        });
        runMyApp('restore', ['-e', 'groups']);
    });
    
    after('cleanup', function() {
        del.sync(path.join(__dirname, '../newdeveloper'));
    });
});

describe('restore from non-existing dir', () => { 
    it('log error and exit', function (done) {
        this.timeout(20000);    // 20 seconds
        subscribe('myApp', /backup dir does not exist/, data => {
            done();
        });
        runMyApp('restore', ['-d', '/tmp/1/2/3/4']);
    });
});

describe('restore from empty dir', () => { 
    it('log error and exit', function (done) {
        this.timeout(20000);    // 20 seconds
        subscribe('myApp', /backup file does not exist/, data => {
            done();
        });
        runMyApp('restore', ['-d', '/tmp', '-e', 'lights']);
    });
});
