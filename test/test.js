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

const hueCmd = path.join(__dirname, '../index.js');
const hueArgs = ['--config-file', 'test/config.json'];

let hue;
let huePipeOut;
let huePipeErr;
const hueSubscriptions = {};
const hueBuffer = [];

let subIndex = 0;

function subscribe(type, rx, cb) {
    subIndex += 1;
    if (type === 'sim') {
        simSubscriptions[subIndex] = {rx, cb};
    } else if (type === 'hue') {
        hueSubscriptions[subIndex] = {rx, cb};
    }
    matchSubscriptions(type);
    return subIndex;
}

// function unsubscribe(type, subIndex) {
//     if (type === 'sim') {
//         delete simSubscriptions[subIndex];
//     } else if (type === 'hue') {
//         delete hueSubscriptions[subIndex];
//     }
// }

function matchSubscriptions(type, data) {
    let subs;
    let buf;
    if (type === 'sim') {
        subs = simSubscriptions;
        buf = simBuffer;
    } else if (type === 'hue') {
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

function runBackup(extra_args = []) {
    var args = ['backup'].concat(hueArgs, extra_args);
    hue = cp.spawn(hueCmd, args);
    huePipeOut = hue.stdout.pipe(streamSplitter('\n'));
    huePipeErr = hue.stderr.pipe(streamSplitter('\n'));
    huePipeOut.on('token', data => {
        console.log('hue', data.toString());
        matchSubscriptions('hue', data.toString());
    });
    huePipeErr.on('token', data => {
        console.log('hue', data.toString());
        matchSubscriptions('hue', data.toString());
    });
}

function end(code) {
    if (hue.kill) {
        hue.kill();
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

describe('run backup', () => {
    
    it('backup provided endpoints without error', function (done) {
        this.timeout(20000);
        subscribe('hue', /saved .\/newdeveloper\/schedules.json/, data => {
            done();
        });
        runBackup([]);
    });
    
    it('expect a json file for each endpoint', function() {
        ['config','groups','lights','schedules'].forEach(function(endpoint){
           expect('./newdeveloper/' + endpoint + '.json').to.be.a.jsonFile(); 
        });
    });
    
    it('exit and log error when provided a bad endpoint', function (done) {
        this.timeout(20000);
        subscribe('hue', /Invalid values/, data => {
            done();
        });
        runBackup(['-e', 'badendpoint']);
    });
    
    it('fail and log error when provided a bad port', function (done) {
        this.timeout(20000);
        subscribe('hue', /ECONNREFUSED/, data => {
            done();
        });
        runBackup(['-b', '0.0.0.0:9999', '-e', 'config']);
    });

    // long timeout here    
    // it('timeout and log error when provided a bad address', function (done) {
    //     this.timeout(200000);
    //     subscribe('hue', /ETIMEDOUT/, data => {
    //         done();
    //     });
    //     runBackup(['-b', '99.99.99.99:9000', '-e', 'config']);
    // });
    
    after('cleanup', function() {
        del.sync(path.join(__dirname, '../newdeveloper'));
    });
});