#!/usr/bin/env node

'use strict';

const config = require('config.json')('./config.json');
const Bridge = require('./bridge');
const fs = require('fs');

const valid_endpoints = [ "config", "groups", "lights", "resourcelinks", "rules", "scenes", "schedules", "sensors" ];
const hue_bridge = new Bridge(config.bridge_ip, config.bridge_user);

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
                if (err) {
                    return console.log(err);
                }
                console.log("saved to " + outfile);
            });
        });
    });
}

const outdir = "./" + Date.now();
backup(outdir, process.argv.slice(2));
