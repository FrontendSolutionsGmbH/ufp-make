const path = require('path')
const yargsConfig = require('../src/YargsConfig')
const logger = require('../src/Logger')('ufp-make')
const fs = require('fs')
const Constants = require('../src/Constants')
const UfpMake = require('../src/UfpMake')

logger.mark('start')

logger.debug('Command Line Parameters are', JSON.stringify(yargsConfig.argv))
var expectedPath = path.join(process.cwd(), yargsConfig.argv.CONFIG)
var fallbackPath = path.join(__dirname, '..', 'default', Constants.YAML_FILENAME)
var config
if (fs.existsSync(expectedPath)) {
    config = expectedPath
} else {
    config = fallbackPath
}

UfpMake.makeFile({
    fileName: config,
    options: {
        ...yargsConfig.argv
    }
})
