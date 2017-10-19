const path = require('path')
const yargs = require('yargs')
const logger = require('../src/Logger')('ufp-make')
const fs = require('fs')
const Constants = require('../src/constants')
const UfpMake = require('../src/UfpMake')

logger.mark('start')
yargs.version('1.0.0')

Object.keys(Constants.MAKE_OPTIONS)
      .map((key) => {
          yargs.option(key, Constants.MAKE_OPTIONS[key])
      })

// logger.info('YARGS INPUT IS', JSON.stringify(yargs.argv))

const argv = yargs.argv
const {FORCE} = argv
logger.debug('Command Line Parameters are', JSON.stringify(argv))
var expectedPath = path.join(process.cwd(), Constants.YAML_FILENAME)
var fallbackPath = path.join(__dirname, '..', 'default', Constants.YAML_FILENAME)
var config
if (fs.existsSync(expectedPath)) {
    config = expectedPath
} else {
    config = fallbackPath
}

UfpMake.makeFile({
    fileName: config,
    options: {FORCE}
})
