#!/usr/bin/env node

'use strict';

const cp = require('child_process');
const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const streamSplitter = require('stream-splitter');
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
    it('hue-simulator should start without error', function (done)  {
        this.timeout(20000);
        subscribe('sim', /hue simulator listening/, data => {
            done();
        });
        startSim();
    });
});

describe('run backup with config file', () => {
    
    it('last endpoint saved', function (done) {
        this.timeout(20000);
        subscribe('myApp', /saved .\/newdeveloper\/schedules.json/, data => {
            done();
        });
        runMyApp();
    });
    
    it('expect a json file for each endpoint', function() {
        ['config','groups','lights','schedules'].forEach(function(endpoint){
           expect('./newdeveloper/' + endpoint + '.json').to.be.a.jsonFile(); 
        });
    });
    
    after(function() {
        del.sync(path.join(__dirname, '../newdeveloper'));
    });
});

describe('run backup with blank backup dir', () => {
    it('use ./{bridgeUser} as backup dir', function (done) {
        this.timeout(20000);
        subscribe('myApp', /saved .\/newdeveloper\/schedules.json/, data => {
            done();
        });
        runMyApp('backup', ['-d', '']);
    });
    
    it('expect a json file for each endpoint', function() {
        ['config','groups','lights','schedules'].forEach(function(endpoint){
           expect('./newdeveloper/' + endpoint + '.json').to.be.a.jsonFile(); 
        });
    });
    
    after('cleanup', function() {
        del.sync(path.join(__dirname, '../newdeveloper'));
    });
});

describe('run backup with invalid backup dir', () => {
    it('log error and exit', function (done) {
        this.timeout(20000);
        subscribe('myApp', /ENOENT/, data => {
            done();
        });
        runMyApp('backup', ['-d', '/tmp/1/2/3/4']);
    });
    
    after('cleanup', function() {
        del.sync(path.join(__dirname, '../newdeveloper'));
    });
});

describe('run backup with invalid endpoint', () => {
    it('log error and exit', function (done) {
        this.timeout(20000);
        subscribe('myApp', /Invalid values/, data => {
            done();
        });
        runMyApp('backup', ['-e', 'badendpoint']);
    });
    
    after('cleanup', function() {
        del.sync(path.join(__dirname, '../newdeveloper'));
    });
});

describe('run backup with non-listening port', () => { 
    it('log error and exit', function (done) {
        this.timeout(20000);    // 20 seconds
        subscribe('myApp', /ECONNREFUSED/, data => {
            done();
        });
        runMyApp('backup', ['-b', '0.0.0.0:9999', '-e', 'config']);
    });
    
    after('cleanup', function() {
        del.sync(path.join(__dirname, '../newdeveloper'));
    });
});

// describe('run restore with config file', () => { 
//     it('log error and exit', function (done) {
//         this.timeout(20000);    // 20 seconds
//         subscribe('myApp', /not implimented yet/, data => {
//             done();
//         });
//         runMyApp('restore');
//     });
// });

// describe('run backup with invalid ip address', () => { 
//     it('log error and exit', function (done) {
//         this.timeout(200000);   // 2 minutes
//         subscribe('myApp', /ETIMEDOUT/, data => {
//             done();
//         });
//         runMyApp('backup', ['-b', '192.0.2.100:9000', '-e', 'config']);
//     });
    
//     after('cleanup', function() {
//         del.sync(path.join(__dirname, '../newdeveloper'));
//     });
// });