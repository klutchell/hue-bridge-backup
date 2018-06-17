# hue-bridge-backup

Backup and restore [Philips Hue](https://www.developers.meethue.com/) bridge
configuration in raw JSON for easy editing.

## Motivation

I have a number of complex [Labs](https://labs.meethue.com/) configured and
I was looking for a way to backup (and modify?) and restore configuration on
my Hue Bridge.
The Hue app doesn't offer any backup options, but does provide a way to wipe the
current configuration and automatically restore lights and groups.

## Installation

    npm install @klutchell/hue-bridge-backup

## Usage

    $ index.js --help

    Usage: index.js <cmd> [options]
    
    Commands:
      index.js backup   Backup data to a local directory
      index.js restore  Restore data from a local directory
    
    Options:
      -c, --config-file  Path to JSON config file
      -b, --bridge-ip    Hue bridge address:port                 [string] [required]
      -u, --bridge-user  Hue bridge user                         [string] [required]
      -d, --backup-dir   Path to Hue backup directory                       [string]
      -e, --endpoints    Hue endpoints list
       [array] [required] [choices: "config", "groups", "lights", "rules", "scenes",
                   "schedules", "sensors"] [default: ["rules","schedules","scenes"]]
      -h, --help         Show help                                         [boolean]
      -v, --version      Show version number                               [boolean]
    
    Examples:
      index.js backup -b "192.168.86.131" -u <uuid> -d ./my-backup -e rules scenes
      index.js restore -d ./my-backup

## Tests

[![Build Status](https://travis-ci.org/klutchell/hue-bridge-backup.svg?branch=master)](https://travis-ci.org/klutchell/hue-bridge-backup)
[![Coverage Status](https://coveralls.io/repos/github/klutchell/hue-bridge-backup/badge.svg?branch=master)](https://coveralls.io/github/klutchell/hue-bridge-backup?branch=master)

    npm test

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code.

## Author

Kyle Harding <kylemharding@gmail.com>

## Acknowledgments

_tbd_

## References

* https://www.developers.meethue.com/documentation/getting-started
* https://github.com/owagner/hue2mqtt

## License

This project is licensed under [MIT](./LICENSE)