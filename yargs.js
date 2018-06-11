#!/usr/bin/env node

'use strict';

module.exports = require('yargs')

    .usage('Usage: node $0 <cmd> [options]')
    .example('node $0 backup -e rules schedules scenes -b 192.168.86.131 -u <uuid>')
    
    .alias('h', 'help')
    .alias('v', 'version')
    
    .implies('bridge', 'user')
    
    .demandCommand(1,1)
    .command('backup', 'Backup data to a local directory')
    .command('restore', 'Restore data from a local directory')
    
    .option('c', {
        config: true,
        description: 'Path to JSON config file',
        alias: 'config',
        default: './config.json',
        nargs: 1
    })
    
    .option('b', {
        string: true,
        description: 'Hue bridge address',
        alias: 'bridge',
        nargs: 1
    })
    
    .option('u', {
        string: true,
        description: 'Hue bridge user',
        alias: 'user',
        nargs: 1
    })
    
    .option('d', {
        string: true,
        description: 'Backup directory',
        // default: './backups',
        alias: 'dir',
        nargs: 1
    })
    
    .option('e', {
        array: true,
        description: 'Hue endpoints',
        default: ['rules', 'schedules', 'scenes'],
        alias: 'endpoints',
        choices: ['config','groups','lights','resourcelinks','rules','scenes','schedules','sensors']
    })
    
    .epilog('for more information visit https://github.com/klutchell/hueconf')
    .strict(true)
    .argv;