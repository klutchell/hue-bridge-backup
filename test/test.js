#!/usr/bin/env node

'use strict';

const cp = require('child_process');
const path = require('path');
const chai = require('chai');
chai.use(require('chai-json'));
const expect = chai.expect;
const streamSplitter = require('stream-splitter');
const del = require('del');

const sim_host = '0.0.0.0';
const sim_port = '9000';
const sim_user = 'newdeveloper';
const sim_cmd = path.join(__dirname, '../node_modules/.bin/hue-simulator');
const sim_args = ['--hostname=' + sim_host, '--port=' + sim_port];

let sim;
let simPipeOut;
let simPipeErr;
const simSubscriptions = {};
const simBuffer = [];

const hue_cmd = path.join(__dirname, '../index.js');    // relative to test.js
const hue_args = [];
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
    sim = cp.spawn(sim_cmd, sim_args);
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
    var args = ['backup'].concat(hue_args, extra_args);
    hue = cp.spawn(hue_cmd, args);
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
    
    it('should backup rules without error', function (done) {
        this.timeout(20000);
        subscribe('hue', /saved to .\/newdeveloper\/rules.json/, data => {
            done();
        });
        runBackup(['-u', sim_user, '-b', sim_host + ':' + sim_port, "-e", "rules"]);
    });
    it('./newdeveloper/rules.json should be a json file', function() {
        var result = "./newdeveloper/rules.json";
        expect(result).to.be.a.jsonFile();
    });
    
    it('should backup scenes without error', function (done) {
        this.timeout(20000);
        subscribe('hue', /saved to .\/newdeveloper\/scenes.json/, data => {
            done();
        });
        runBackup(['-u', sim_user, '-b', sim_host + ':' + sim_port, "-e", "scenes"]);
    });
    it('./newdeveloper/scenes.json should be a json file', function() {
        var result = "./newdeveloper/scenes.json";
        expect(result).to.be.a.jsonFile();
    });
    
    it('should backup schedules without error', function (done) {
        this.timeout(20000);
        subscribe('hue', /saved to .\/newdeveloper\/schedules.json/, data => {
            done();
        });
        runBackup(['-u', sim_user, '-b', sim_host + ':' + sim_port, "-e", "schedules"]);
    });
    it('./newdeveloper/schedules.json should be a json file', function() {
        var result = "./newdeveloper/schedules.json";
        expect(result).to.be.a.jsonFile();
    });
    
    it('should print error when provided a bad endpoint', function (done) {
        this.timeout(20000);
        subscribe('hue', /Invalid values/, data => {
            done();
        });
        runBackup(['-u', sim_user, '-b', sim_host + ':' + sim_port, "-e", "badendpoint"]);
    });
    
    it('should print error when provided a bad host', function (done) {
        this.timeout(200000);
        subscribe('hue', /ETIMEDOUT/, data => {
            done();
        });
        runBackup(['-u', sim_user, '-b', '99.99.99.99' + ':' + sim_port, "-e", "rules"]);
    });
    
    it('should print error when provided a bad port', function (done) {
        this.timeout(20000);
        subscribe('hue', /ECONNREFUSED/, data => {
            done();
        });
        runBackup(['-u', sim_user, '-b', sim_host + ':' + '55555', '-e', 'rules']);
    });
    
    after('cleanup', function() {
        del.sync(path.join(__dirname, '../newdeveloper'));
    });
});