const yaml = require('js-yaml')
const logger = require('../src/Logger')('ufp-make')
const fs = require('fs')
const execSync = require('child_process').execSync
const JsUtils = require('./JsUtils')
var merge = require('deepmerge')

logger.mark('start')
var currentPhase = 'default'
var countSuccessCommands = {}
var countFailCommands = {}
var countCommands = {}

const defaultOptions = {
    TARGET: 'default',
    FORCE: false,
    VARIABLES: {
        UFP_VERSION: '1.0.0',
        UFP_API_TYPE: 'mock',
        UFP_THEME: 'default',
        UFP_NODE_ENV: 'development'
    }
}

var _options = defaultOptions

const loadYAML = (filename) => {
    var result = {}
    try {
        result = yaml.safeLoad(fs.readFileSync(filename, 'utf8'))
    } catch (e) {
        logger.error(e)
    }
    return result
}

const initByObject = (obj) => {
    init(obj)
    processUfpMakeDefinition(obj)
}

const initByConfigFile = (pathName) => {
    logger.info('Using config file ', pathName)
    logger.info('Using config file ', pathName)
    logger.info('Using config file ', pathName)
    logger.info('Using config file ', pathName)
    var yaml
    if (fs.existsSync(pathName)) {
        yaml = loadYAML(pathName)
        initByObject(yaml)
    } else {
        throw new Error('YML Config not found')
    }
}

const init = (yamlmakefile) => {
    logger.info(yamlmakefile)
// init stats
    Object.keys(yamlmakefile.tasks)
          .map((task) => {
              logger.debug('Registering task', task)
              countCommands[task] = 0
              countFailCommands[task] = 0
              countSuccessCommands[task] = 0
          })

    Object.keys(yamlmakefile.targets)
          .map((target) => {
              logger.debug('Registering target', target)
          })
}
const replaceVars = (string) => {
    var result = string
    Object.keys(_options.VARIABLES)
          .map((key) => {
              result = result.replace('${' + key + '}', _options.VARIABLES[key])
          })
    return result
}

const handleError = (err) => {
    countFailCommands[currentPhase]++
//    logger.error('Execution failedxxx', err)
    logger.info(err.stderr.toString())
    logger.debug(err.stdout.toString())
    // logger.error('Execution failed', err)
    if (!_options.FORCE) {
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
    } else {
        logger.mark('Starting:', command.name)
        logger.info(command.description)
        var dependsOnResult = {
            reasons: [],
            isValid: true
        }
        if (command.dependsOn) {
            dependsOnResult = isPhaseValid(command.dependsOn)
        }

        if (dependsOnResult.isValid) {
            command.commands.map(executeCommandArea)
        } else {
            logger.mark('Skipping %s because of fails in ', command.name, dependsOnResult.reasons)
        }
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

const isPhaseValid = (phases) => {
    var isPhaseValid = true
    var failReasons = []
    if (Array.isArray(phases)) {
        phases.map((key) => {
            if (countFailCommands[key] > 0) {
                isPhaseValid = false
                failReasons.push(key)
            }
        })
    } else {
        if (countFailCommands[phases] > 0) {
            isPhaseValid = false
            failReasons.push(phases)
        }
    }
    return {
        reasons: failReasons,
        isValid: isPhaseValid
    }
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
    } catch (err) {
        logger.error('FAIL [', command, ']')
        handleError(err)
    }
}

const processTarget = (ufpMakeDefinition, theTarget) => {
    logger.debug('Target Definition is', theTarget)

    theTarget.map((target) => {
        logger.info('Proccessing target', target)
        // check if target is another target or a task
        if (ufpMakeDefinition.targets[target]) {
            logger.debug('Target is referencing another target', target)
            logger.debug('Target is referencing another target', ufpMakeDefinition)
            logger.debug('Target is referencing another target', ufpMakeDefinition.targets['production'])
            processTarget(ufpMakeDefinition, ufpMakeDefinition.targets[target])
        } else if (ufpMakeDefinition.tasks[target]) {
            logger.debug('Proccessing task target', target)
            currentPhase = target
            executeCommandArea(ufpMakeDefinition.tasks[target])
        }
    })
}
const processUfpMakeDefinition = (ufpMakeDefinition) => {
    logger.debug('Processing   ', ufpMakeDefinition)
    logger.debug('Options ', _options)
    try {
        var theTarget = ufpMakeDefinition.targets[_options.TARGET]
        if (theTarget === undefined) {
            theTarget = ufpMakeDefinition.tasks[_options.TARGET]
            if (theTarget === undefined) {
                logger.mark('Target/Task not found ', _options.TARGET)
            } else {
                currentPhase = _options.TARGET
                executeCommandArea(theTarget)
            }
        } else {
            currentPhase = _options.TARGET
            processTarget(ufpMakeDefinition, theTarget)
        }
    } catch (e) {
        logger.error(e.message)
//        logger.debug(e)
    }

    printStats()
    logger.mark('finished')
}
module.exports = {

    makeFile: ({
        fileName = JsUtils.throwParam('Filename required for makeFile(), expecting a parameter object'),
        options = defaultOptions
    }) => {
        logger.mark('Loading makefile ', fileName, options)
        if (options) {
            logger.mark('Loading makefile ', fileName, options)
        }

        _options = merge(defaultOptions, options)
        initByConfigFile(fileName)
    },
    make: ({ufpMakeDefinition, options}) => {

    }

}
