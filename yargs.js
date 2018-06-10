const pkg = require('./package.json');

// module.exports = require('yargs')
//     .env('HUECONF')
//     .usage(pkg.name + ' ' + pkg.version + '\n' + pkg.description + '\n\nUsage: $0 [options]')
//     .describe('user', 'Hue bridge user')
//     .describe('bridge', 'Hue bridge address')
//     .describe('debug', 'Enable debug logging')
//     .boolean('debug')
//     .string('user')
//     .string('bridge')
//     .alias({
//         h: 'help',
//         u: 'user',
//         d: 'debug',
//         b: 'bridge',
//         v: 'version'
//     })
//     .default({
//         user: 'newdeveloper',
//         bridge: '127.0.0.1',
//         debug: false
//     })
//     .version()
//     .help('help')
//     .argv;

module.exports = require('yargs')
    .usage('Usage: $0 <endpoints> [options]')
    .command('endpoints', 'spaced list of hue endpoints')
    .example('$0 rules schedules scenes -b 192.168.86.131 -u WcuMpsK4g34fG3S')
    .alias('u', 'user')
    .alias('b', 'bridge')
    .alias('d', 'debug')
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
    .alias('h', 'help')
    .epilog('Copyright 2018 <kylemharding@gmail.com>')
    .argv;