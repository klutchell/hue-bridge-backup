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
 * backup endpoint to a local directory
 * @param {string} backup directory
 * @param {string} hue endpoint
 */
module.exports.backup = (backupDir, endpoint) => {

    if (typeof endpoint === 'undefined') return;
    
    const outfile = backupDir + '/' + endpoint + '.json';
    const url = 'http://' + config.bridgeIp + "/api/" + config.bridgeUser + "/" + endpoint;
    
    if (!fs.existsSync(backupDir)) {
        console.log('creating ' + backupDir);
        fs.mkdirSync(backupDir);
    }
    
    console.log('getting ' + url);
    request(url, { method: 'GET', json: true }, (err, res, body) => {
        if (err) { return console.log(err); }
        
        fs.writeFile(outfile, JSON.stringify(body, null, 2), (err) => {  
            if (err) throw err;
            console.log('saved ' + outfile);
        });
        
        return nextEndpoint();
    });
};

/**
 * restore endpoint from a local directory
 * @param {string} backup directory
 * @param {string} hue endpoint
 */
module.exports.restore = (backupDir, endpoint) => {
        
    const infile = backupDir + '/' + endpoint + '.json';
    const url = 'http://' + config.bridgeIp + "/api/" + config.bridgeUser + "/" + endpoint;
    
    const json = JSON.parse(fs.readFileSync(infile, 'utf8'));
    
    let resources = [];
    if (endpoint === 'config')
        resources = [json];
    else
        resources = Object.values(json);
    
    const putResource = (resource) => {

        if (typeof resource === 'undefined') return nextResource();
        
        delete resource.owner;
        delete resource.created;
        delete resource.lasttriggered;
        delete resource.timestriggered;
        
        console.log('putting ' + (resourceIdx + 1) + '/' + resources.length + ' ' + endpoint + ' to ' + url);
        request(url, { method: 'PUT', json: true, body: resource}, (err, res, body) => {
            if (err) { return console.log(err); }
            console.log(body);
            return nextResource();
        });
    };
    
    const nextResource = () => {
        resourceIdx++;
        if (resourceIdx >= resources.length) return nextEndpoint();
        
        setTimeout( function(res) {
            putResource(res);
        }.bind(this, resources[resourceIdx]), 1000);
        return;
    };
    
    if (!fs.existsSync(backupDir)) {
        console.log('backup dir does not exist: ' + backupDir);
        return;
    }
    
    if (!fs.existsSync(infile)) {
        console.log('backup file does not exist: ' + infile);
        return;
    }
    
    let resourceIdx = 0;
    putResource(resources[resourceIdx]);
};

const nextEndpoint = () => {
    endpointIdx++;
    if (endpointIdx >= config.endpoints.length) return;
    setTimeout( function(backupDir, endpoint) {
        this[argv._[0]](backupDir, endpoint);
    }.bind(this, config.backupDir, config.endpoints[endpointIdx]), 1000);
    return;
};

let endpointIdx = 0;
this[argv._[0]](config.backupDir, config.endpoints[endpointIdx]);
