#!/usr/bin/env node

'use strict';

const Client = require('node-rest-client').Client;

/**
 * init bridge instance
 * @param {string} bridge ip
 * @param {string} bridge user
 * @return {object} bridge object
 */
function Bridge(bridge_ip, bridge_user) {
    this.client = new Client();
    this.ip = bridge_ip;
    this.user = bridge_user;
    // console.log(this);
}

/**
 * get endpoint from hue bridge
 * @param {string} endpoint
 * @param {object} return function
 * @return {string} json string data
 */
Bridge.prototype.get = function(endpoint, fn) {
    
    var endpoint_url = "http://" + this.ip + "/api/" + this.user + "/" + endpoint;
    
    console.log("GET " + endpoint_url);
    
	var req = this.client.get(endpoint_url, function (data, response) {
        fn(JSON.stringify(data, null, 2));
    });
    
    req.on('requestTimeout', function (req) {
        console.log('request has expired');
        req.abort();
    });
     
    req.on('responseTimeout', function (res) {
        console.log('response has expired');
        req.abort();
    });
     
    req.on('error', function (err) {
        console.log('request error', err);
        // req.abort();
    });
};

module.exports = Bridge;