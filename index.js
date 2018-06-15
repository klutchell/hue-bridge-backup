#!/usr/bin/env node

'use strict';

const argv = require('./yargs.js');
const fs = require('fs');
const request = require('request');

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
module.exports.backup = function(backupDir, endpoints) {
    
    const getEndpoint = (endpoint) => {
        
        const outfile = backupDir + '/' + endpoint + '.json';
        const url = 'http://' + config.bridgeIp + "/api/" + config.bridgeUser + "/" + endpoint;
        
        if (!fs.existsSync(backupDir)) {
            console.log('creating ' + backupDir);
            fs.mkdirSync(backupDir);
        }
        
        console.log('getting ' + url);
        request(url, { json: true }, (err, res, body) => {
            if (err) { return console.log(err); }
            
            fs.writeFile(outfile, JSON.stringify(body, null, 2), (err) => {  
                if (err) throw err;
                console.log('saved ' + outfile);
            });
            
            index++;
            if (index >= endpoints.length) return;
            
            setTimeout(function(endpoint){
                getEndpoint(endpoint);
            }.bind(this, endpoints[index]), 1000);
        
        });
    };
    
    let index = 0;
    getEndpoint(endpoints[index]);
};

module.exports.restore = function(dir, arr) {
    // TODO
    console.log('not implimented yet!');
};

this[argv._[0]](config.backupDir, config.endpoints);
