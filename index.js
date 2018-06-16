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
module.exports.backup = (backupDir, endpoints) => {
    
    const getEndpoint = (endpoint) => {
        
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
            
            return nextFn();
        });
        
        const nextFn = () => {
            endpointIdx++;
            if (endpointIdx >= endpoints.length) return;
            
            setTimeout( function(end) {
                getEndpoint(end);
            }.bind(this, endpoints[endpointIdx]), 1000);
            return;
        };
    };
    
    let endpointIdx = 0;
    getEndpoint(endpoints[endpointIdx]);
};

module.exports.restore = (backupDir, endpoints) => {
    
    const setEndpoint = (endpoint) => {
        
        const infile = backupDir + '/' + endpoint + '.json';
        const url = 'http://' + config.bridgeIp + "/api/" + config.bridgeUser + "/" + endpoint;
        
        if (!fs.existsSync(infile)) {
            console.log('backup file does not exist: ' + infile);
            return;
        }
        
        const resources = Object.values(JSON.parse(fs.readFileSync(infile, 'utf8')));
        
        const putResource = (resource) => {

            if (typeof resource === 'undefined') return nextFn();
            
            delete resource.owner;
            delete resource.created;
            delete resource.lasttriggered;
            delete resource.timestriggered;
            
            console.log('putting ' + (resourceIdx + 1) + '/' + resources.length + ' ' + endpoint + ' to ' + url);
            request(url, { method: 'PUT', json: true, body: resource}, (err, res, body) => {
                if (err) { return console.log(err); }
                console.log(body);
                return nextFn();
            });
        };
        
        const nextFn = () => {
            resourceIdx++;
            if (resourceIdx >= resources.length) {
                
                endpointIdx++;
                if (endpointIdx >= endpoints.length) return;
                
                setTimeout( function(end) {
                    setEndpoint(end);
                }.bind(this, endpoints[endpointIdx]), 0);
                return;
            }
            
            setTimeout( function(res) {
                putResource(res);
            }.bind(this, resources[resourceIdx]), 1000);
            return;
        };
        
        let resourceIdx = 0;
        putResource(resources[resourceIdx]);
    };
    
    if (!fs.existsSync(backupDir)) {
        console.log('backup dir does not exist: ' + backupDir);
        return;
    }
    
    let endpointIdx = 0;
    setEndpoint(endpoints[endpointIdx]);
};

this[argv._[0]](config.backupDir, config.endpoints);
