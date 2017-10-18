const path = require('path')
const yaml = require('js-yaml')
const yargs = require('yargs')
const logger = require('../src/Logger')('ufp-make')
const fs = require('fs');
const Constants = require('../src/constants')
const execSync = require('child_process').execSync

logger.mark('start')
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
var currentPhase = 'default'
var currentArea = 'none'
var countSuccessCommands = {}
var countFailCommands = {}
var countCommands = {}
// Get document, or throw exception on error
var yamlmakefile

var expectedPath = path.join(process.cwd(), Constants.YAML_FILENAME)
var fallbackPath = path.join(__dirname, '..', 'default', Constants.YAML_FILENAME)

const loadYAML = (filename) => {

    var result = {}
    try {
        result = yaml.safeLoad(fs.readFileSync(filename, 'utf8'))

    } catch (e) {
        logger.error(e);
    }
    return result

}

if (fs.existsSync(expectedPath)) {
    yamlmakefile = loadYAML(expectedPath)
} else {

    yamlmakefile = loadYAML(fallbackPath)
}

// init stats
yamlmakefile.phases.map((phase) => {
    countCommands[phase] = 0
    countFailCommands[phase] = 0
    countSuccessCommands[phase] = 0
})

const replaceVars = (string) => {
    var result = string
    Object.keys(argv)
          .map((key) => {
              result = result.replace('${' + key + '}', argv[key])
          })
    return result

}

const handleError = (err) => {
    countFailCommands[currentPhase]++
//    logger.error('Execution failedxxx', err)
    logger.error(err.stderr.toString())
    logger.debug(err.stdout.toString())
    // logger.error('Execution failed', err)
    if (!FORCE) {
        throw new Error('exiting, use --FORCE to continue on fail')
    } else {
        logger.warn('Continuing build although step failed!')
    }
}
const executeCommandArea = (command) => {
//    console.log('area is ', command)
    if (typeof command === 'string' || command instanceof String) {
        executeCommand(command)
    } else if (Array.isArray(command)) {

        command.map(executeCommandArea)

    }
    else {
        logger.mark('Starting:', command.name)
        currentArea = command.name

        logger.info(command.description)
        command.commands.map(executeCommandArea)
        logger.mark('Finished:', command.name)
    }
}
const printStats = () => {
    Object.keys(countCommands)
          .map((key) => {
              if (countFailCommands[key] > 0) {
                  logger.mark('%d of %d failed for: [%s]', countFailCommands[key], countCommands[key], key)
              } else if (countCommands[key] === 0) {
                  logger.mark('not started: [%s]', key)
              } else {
                  logger.mark('succesful: [%s]', key)
              }
          })
}
const executeCommand = (commandIn) => {
    countCommands[currentPhase]++
    const command = replaceVars(commandIn)
    try {

        logger.info('EXEC [', command, ']')
        const output = execSync(command, {
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe']

        })

        logger.info('END [ ', command, '] ')

        logger.debug('stdout was:')
        logger.debug(output.toString())
        countSuccessCommands[currentPhase]++
    }
    catch (err) {
        logger.error('FAIL [', command, ']')
        handleError(err)
    }
}

try {
    yamlmakefile.phases.map((phase) => {
        logger.info('Executing phase ', phase)
        currentPhase = phase
        executeCommandArea(yamlmakefile[phase])
    })

    logger.mark('success')

} catch (e) {

    logger.error(e.message)

}

printStats()
logger.mark('finished')