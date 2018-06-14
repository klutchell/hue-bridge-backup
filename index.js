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
module.exports.backup = function(dir, arr) {
    
    const getEndpoint = async (endpoint, outdir) => {
        
        const outfile = outdir + '/' + endpoint + '.json';
        const url = "http://" + config.bridgeIp + "/api/" + config.bridgeUser + "/" + endpoint;
        
        console.log("getting " + url);
        
        const getEndpoint = async url => {
            try {
                const response = await fetch(url);
                const json = await response.json();
                saveEndpoint(json);
            } catch (err) {
                console.log(err);
            }
        };

        const saveEndpoint = async data => {
            try {
                await fs.mkpath(outdir);   // make sure path exists
                await fs.writeFile(outfile, JSON.stringify(data, null, 2), { encoding: 'utf8' });   // write to file
            } catch (err) {
                console.log(err);
            }
        };

        getEndpoint(url);
        
        console.log('saved ' + outfile);
    };
    
    // for each provided endpoint
    arr.forEach(function(endpoint) {
        getEndpoint(endpoint, dir);
    });
};

module.exports.restore = function(dir, arr) {
    // TODO
    console.log('not implimented yet!');
};

this[argv._[0]](config.backupDir, config.endpoints);
