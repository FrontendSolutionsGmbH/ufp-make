var log4js = require('log4js')
const yargsConfig = require('./YargsConfig')

module.exports = (area) => {
    const logger = log4js.getLogger(area)
    logger.level = yargsConfig.argv.LOG_LEVEL.toLowerCase()
    return logger
}
