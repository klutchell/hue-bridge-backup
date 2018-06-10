#!/usr/bin/env node

'use strict';

module.exports = require('yargs')
    .usage('Usage: $0 <endpoints> [options]')
    .command('endpoints', 'spaced list of hue endpoints')
    .example('$0 rules schedules scenes -b 192.168.86.131 -u WcuMpsK4g34fG3S')
    .alias('u', 'user')
    .alias('b', 'bridge')
    .alias('d', 'debug')
    .alias('h', 'help')
    .nargs('u', 1)
    .nargs('b', 1)
    .nargs('d', 0)
    .describe('u', 'Hue bridge user')
    .describe('b', 'Hue bridge address')
    .describe('d', 'Enable debug logging')
    .boolean('debug')
    .string('user')
    .string('bridge')
    .demandCommand(1)
    .help('h')
    .epilog('Copyright 2018 <kylemharding@gmail.com>')
    .argv;