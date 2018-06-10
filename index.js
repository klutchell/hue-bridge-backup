#!/usr/bin/env node

'use strict';

const args = require('./yargs.js');
const Bridge = require('./bridge.js');
const fs = require('fs');

const valid_endpoints = [ "config", "groups", "lights", "resourcelinks", "rules", "scenes", "schedules", "sensors" ];

var config = {};
config.bridge = args.bridge;
config.user = args.user;
config.endpoints = args.endpoints;

// persist important args to a file
fs.writeFile(args.config, JSON.stringify(config, null, 2), 'utf8', function (err) {
    if (err) { return console.log(err); }
});

// init a hue bridge instance
var hue_bridge = new Bridge(args.bridge, args.user);

/**
 * backup data to a local directory
 * @param {string} backup directory
 * @param {array} hue endpoints
 */
function backup(dir, arr) {
    
    // for each provided endpoint
    arr.forEach(function(endpoint){
        
        // check against value endpoints
        if (!valid_endpoints.includes(endpoint)) {
            console.log(endpoint + " is not a valid endpoint");
            return;
        }
        
        // write to a file <backupdir>/<endpoint>.json
        var outfile = dir + "/" + endpoint + ".json";
        
        console.log("backing up " + endpoint);
        
        // request endpoint data from bridge
    	hue_bridge.get(endpoint, function (data) {
    	    
    	    // create destination dir
    	    if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            
            // write data to file
            fs.writeFile(outfile, data, 'utf8', function (err) {
                if (err) { return console.log(err); }
                console.log("saved to " + outfile);
            });
        });
    });
}

function restore(indir, arr) {
    // TODO
}

// backup only for now
backup(args.dir, args.endpoints);
