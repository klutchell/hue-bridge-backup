#!/usr/bin/env node

'use strict';

module.exports = require('yargs')

    .usage('Usage: $0 <cmd> [options]')
    
    .example('$0 backup -b "192.168.86.131" -u <uuid> -d ./my-backup -e rules scenes')
    .example('$0 restore -d ./my-backup')
    
    .alias('h', 'help')
    .alias('v', 'version')
    
    .demandCommand(1,1)
    .command('backup', 'Backup data to a local directory')
    .command('restore', 'Restore data from a local directory')
    
    .option('c', {
        config: true,
        description: 'Path to JSON config file',
        alias: 'config-file',
        nargs: 1
    })
    
    .option('b', {
        string: true,
        description: 'Hue bridge address:port',
        alias: 'bridge-ip',
        nargs: 1,
        demandOption: true
    })
    
    .option('u', {
        string: true,
        description: 'Hue bridge user',
        alias: 'bridge-user',
        nargs: 1,
        demandOption: true
    })
    
    .option('d', {
        string: true,
        description: 'Path to Hue backup directory',
        alias: 'backup-dir',
        nargs: 1
    })
    
    .option('e', {
        array: true,
        description: 'Hue endpoints list',
        default: ['rules', 'schedules', 'scenes'],
        alias: 'endpoints',
        choices: ['config','groups','lights','resourcelinks','rules','scenes','schedules','sensors'],
        demandOption: true
    })
    
    .showHelpOnFail(false, 'Specify --help for available options')
    .epilog('for more information visit https://github.com/klutchell/hue-bridge-backup')
    .strict(true)
    .argv;