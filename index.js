#!/usr/bin/env node

'use strict';

const config = require('config.json')('./config.json');
const Bridge = require('./bridge.js');
const fs = require('fs');

const endpoints = [ "config", "groups", "lights", "resourcelinks", "rules", "scenes", "schedules", "sensors" ];

const bridge = new Bridge(config.bridge_ip, config.bridge_user);

const outdir = "./" + Date.now();

process.argv.forEach(function (val, index, array) {
    
    if (!endpoints.includes(val)) return;
    
    var outfile = outdir + "/" + val + ".json";
    
    console.log("getting " + val);
    
	bridge.get(val, function (data) {
	    if (!fs.existsSync(outdir)){
            fs.mkdirSync(outdir);
        }
        fs.writeFile(outfile, data, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("saved to " + outfile);
        });
    });
});