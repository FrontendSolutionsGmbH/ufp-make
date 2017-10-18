var log4js = require('log4js')
const Constants = require('./constants')

const yargs = require('yargs')
    .option('LOG_LEVEL', Constants.MAKE_OPTIONS.LOG_LEVEL)

module.exports = (area) => {
    const logger = log4js.getLogger(area)
    logger.level = yargs.argv.LOG_LEVEL.toLowerCase()
    return logger
}
