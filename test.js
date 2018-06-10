#!/usr/bin/env node

'use strict';

const cp = require('child_process');
const path = require('path');
const expect = require('chai').expect;
const streamSplitter = require('stream-splitter');
const hueconf = require('./index');

const simCmd = path.join(__dirname, '/node_modules/.bin/hue-simulator');
const simArgs = [];

let sim;
let simPipeOut;
let simPipeErr;
const simSubscriptions = {};
const simBuffer = [];

let subIndex = 0;

function subscribe(type, rx, cb) {
    subIndex += 1;
    simSubscriptions[subIndex] = {rx, cb};
    matchSubscriptions(type);
    return subIndex;
}

function unsubscribe(type, subIndex) {
    delete simSubscriptions[subIndex];
}

function matchSubscriptions(type, data) {
    var subs = simSubscriptions;
    var buf = simBuffer;
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

function end(code) {
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

describe('start simulator', () => {
    it('hue-simulator should start without error', function (done)  {
        this.timeout(20000);
        subscribe('sim', /hue simulator listening/, data => {
            done();
        });
        startSim();
    });
});

describe('#hueconf', function() {
    it('should return json string', function() {
        var result = hueconf.get("localhost", "newdeveloper", "config");
        result.should.have.status(200);
        result.should.be.json;
    });
});

