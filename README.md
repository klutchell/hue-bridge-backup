# hueconf

backup and restore raw Hue bridge configuration

## Installation

    npm install @klutchell/hueconf

## Usage

    node index.js --help
    node index.js backup -b 192.168.86.131 -u <uuid> -d ./my-backup
    node index.js restore -d ./my-backup

## Tests

    npm test

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code.