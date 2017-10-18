const path = require('path')
const yaml = require('js-yaml')
const yargs = require('yargs')
const logger = require('../ext/build/lib/Logger')('ufp-make')
const fs = require('fs');
const Constants = require('../ext/build/scripts/constants')
const execSync = require('child_process').execSync

yargs.version('1.0.0')

Object.keys(Constants.MAKE_OPTIONS)
      .map((key) => {
          yargs.option(key, Constants.MAKE_OPTIONS[key])
      })

// logger.info('YARGS INPUT IS', JSON.stringify(yargs.argv))

const argv = yargs.argv
var {
    FORCE,
    CLEAN,
    UFP_STEP,
    UFP_VERSION,
    UFP_API_TYPE,
    UFP_THEME,
    UFP_NODE_ENV
}=argv

logger.info(JSON.stringify(argv))
var currentArea = 'none'
var countSuccessCommands = {}
var countFailCommands = {}
var countCommands = {}
// Get document, or throw exception on error
var yamlmakefile
try {
    yamlmakefile = yaml.safeLoad(fs.readFileSync(path.join(process.cwd(), 'ufp-make.yml'), 'utf8'))
    logger.info(yamlmakefile);
} catch (e) {
    logger.error(e);
}

const handleError = (err) => {
    countFailCommands[currentArea]++
    logger.error('Execution failedxxx', err)
    logger.error('Execution failedxxx', err.stderr)
    logger.debug('Execution failed', err.stdout)
    // logger.error('Execution failed', err)
    if (!FORCE) {
        throw new Error('exiting, use --FORCE to continue on fail')
    } else {
        logger.warn('Continuing build although step failed!')
    }
}
const executeCommandArea = (command) => {
    console.log('area is ', command)
    if (typeof command === 'string' || command instanceof String) {
        executeCommand(command)
    } else if (Array.isArray(command)) {

        command.map(executeCommandArea)

    }
    else {
        logger.mark('Starting:', command.name)
        currentArea = command.name
        countCommands[currentArea] = 0
        countFailCommands[currentArea] = 0
        countSuccessCommands[currentArea] = 0
        logger.info(command.description)
        command.commands.map(executeCommandArea)
        logger.mark('Finished:', command.name)
    }
}
const executeCommand = (command) => {
    countCommands[currentArea]++
    try {
        logger.info('EXEC [', command, ']')

        const output = execSync(command, {
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe']

        })

        logger.info('END [ ', command, '] ')

        logger.debug('stdout was:')
        logger.debug(output.toString())
        countSuccessCommands[currentArea]++
    }
    catch (err) {
        logger.error('FAIL [', command, ']')
        handleError(err)
    }
}

console.log('Hello World')

yamlmakefile.phases.map((phase) => {

    logger.info('Executing phase ', phase)
    executeCommandArea(yamlmakefile[phase])

})

