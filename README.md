# hueconf

backup and restore raw Hue bridge configuration

## Installation

```bash
npm install @klutchell/hueconf
```

## Usage

```bash
# check usage
node index.js --help

# backup example
node index.js backup -b 192.168.86.131 -u <uuid> -d ./my-backup -e rules scenes
# or
npm run backup -- -b 192.168.86.131 -u <uuid> -d ./my-backup

# restore example
node index.js restore -d ./my-backup -e rules scenes
# or
npm run restore -- -d ./my-backup
```

## Tests

```bash
npm test
```

## Contributing

In lieu of a formal style guide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality.
Lint and test your code.