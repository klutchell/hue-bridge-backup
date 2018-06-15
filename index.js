#!/usr/bin/env node

'use strict';

const argv = require('./yargs.js');
const fs = require('nano-fs');
const fetch = require("node-fetch");

var config = {};
config.bridgeIp = argv.bridgeIp;
config.bridgeUser = argv.bridgeUser;
config.endpoints = argv.endpoints;
config.backupDir = argv.backupDir || "./" + argv.bridgeUser;

/**
 * backup data to a local directory
 * @param {string} backup directory
 * @param {array} hue endpoints
 */
module.exports.backup = function(outdir, endpoints) {
    
    const getEndpoint = async (endpoint) => {
        
        const outfile = outdir + '/' + endpoint + '.json';
        const url = "http://" + config.bridgeIp + "/api/" + config.bridgeUser + "/" + endpoint;
        
        console.log("getting " + url);
        
        try {
            const response = await fetch(url);
            const json = await response.json();
            await fs.mkpath(outdir);   // make sure path exists
            await fs.writeFile(outfile, JSON.stringify(json, null, 2), { encoding: 'utf8' });   // write to file
        } catch (err) {
            console.log(err);
        }
        
        console.log('saved ' + outfile);
        
        index++;
        
        if (index >= endpoints.length) return;
        
        setTimeout(function(endpoint){
            getEndpoint(endpoint);
        }.bind(this, endpoints[index]), 1000);
    };
    
    var index = 0;
    getEndpoint(endpoints[index]);
};

module.exports.restore = function(dir, arr) {
    // TODO
    console.log('not implimented yet!');
};

this[argv._[0]](config.backupDir, config.endpoints);
