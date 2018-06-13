#!/usr/bin/env node

'use strict';

const argv = require('./yargs.js');
const Bridge = require('./bridge.js');
const fs = require('fs');

// const valid_endpoints = [ "config", "groups", "lights", "resourcelinks", "rules", "scenes", "schedules", "sensors" ];

var config = {};
config.bridge_ip = argv.bridge_ip;
config.bridge_user = argv.bridge_user;
config.endpoints = argv.endpoints;
config.backup_dir = argv.backup_dir || "./" + argv.bridge_user;

// persist important args to a file
// fs.writeFile(argv.config, JSON.stringify(config, null, 2), 'utf8', function (err) {
//     if (err) { return console.log(err); }
// });

// init a hue bridge instance
var hue_bridge = new Bridge(config.bridge_ip, config.bridge_user);

/**
 * backup data to a local directory
 * @param {string} backup directory
 * @param {array} hue endpoints
 */
module.exports.backup = function(dir, arr) {
    
    // for each provided endpoint
    arr.forEach(function(endpoint){
        
        // check against valid endpoints
        // if (!valid_endpoints.includes(endpoint)) {
        //     console.log(endpoint + " is not a valid endpoint");
        //     return;
        // }
        
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
};

module.exports.restore = function(dir, arr) {
    // TODO
    console.log('not implimented yet!');
};

this[argv._[0]](config.backup_dir, config.endpoints);
