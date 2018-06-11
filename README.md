# hueconf

Backup and restore [Philips Hue](https://www.developers.meethue.com/) bridge
configuration in raw JSON for easy editing.

## Motivation

I have a number of complex [Labs](https://labs.meethue.com/) configured and
I was looking for a way to backup (and modify?) and restore configuration on
my Hue Bridge.
The Hue app doesn't offer any backup options, but does provide a way to wipe the
current configuration and automatically restore lights and groups.

## Installation

```bash
npm install @klutchell/hueconf
```

## Usage

```bash
$ index.js --help

Commands:
  index.js backup   Backup data to a local directory
  index.js restore  Restore data from a local directory

Options:
  -c, --config     Path to JSON config file           [default: "./config.json"]
  -b, --bridge     Hue bridge address                                   [string]
  -u, --user       Hue bridge user                                      [string]
  -d, --dir        Backup directory                                     [string]
  -e, --endpoints  Hue endpoints
       [array] [choices: "config", "groups", "lights", "resourcelinks", "rules",
     "scenes", "schedules", "sensors"] [default: ["rules","schedules","scenes"]]
  -h, --help       Show help                                           [boolean]
  -v, --version    Show version number                                 [boolean]

Examples:
  index.js backup -b "192.168.86.131" -u <uuid> -d ./my-backup -e rules scenes
  index.js restore -d ./my-backup
```

## Tests

[![Build Status](https://travis-ci.org/klutchell/hueconf.svg?branch=master)](https://travis-ci.org/klutchell/hueconf)
[![Coverage Status](https://coveralls.io/repos/github/klutchell/hueconf/badge.svg?branch=master)](https://coveralls.io/github/klutchell/hueconf?branch=master)

```bash
npm test
```

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

MIT License