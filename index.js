#!/usr/bin/env node

'use strict';

const config_file = './config.json';

const config = require('config.json')(config_file);
const args = require('./yargs.js');
const Bridge = require('./bridge.js');
const fs = require('fs');

const valid_endpoints = [ "config", "groups", "lights", "resourcelinks", "rules", "scenes", "schedules", "sensors" ];

var settings = {};
settings.bridge = args.bridge || config.bridge;
settings.user = args.user || config.user;

// save config to file for reuse
fs.writeFile(config_file, JSON.stringify(settings, null, 2), 'utf8', function (err) {
    if (err) { return console.log(err); }
});

var hue_bridge = new Bridge(settings.bridge, settings.user);

function backup(outdir, arr) {
    
    arr.forEach(function(endpoint){
        
        if (!valid_endpoints.includes(endpoint)) {
            console.log(endpoint + " is not a valid endpoint");
            return;
        }
        
        var outfile = outdir + "/" + endpoint + ".json";
        
        console.log("backing up " + endpoint);
        
        // request endpoint data from bridge
    	hue_bridge.get(endpoint, function (data) {
    	    
    	    // create destination dir
    	    if (!fs.existsSync(outdir)){
                fs.mkdirSync(outdir);
            }
            
            // write data to file
            fs.writeFile(outfile, data, 'utf8', function (err) {
                if (err) { return console.log(err); }
                console.log("saved to " + outfile);
            });
        });
    });
}

const outdir = "./" + Date.now();
backup(outdir, args._);
