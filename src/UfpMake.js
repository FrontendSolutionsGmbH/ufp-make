const yaml = require('js-yaml')
const logger = require('../src/Logger')('ufp-make')
const fs = require('fs')
const execSync = require('child_process').execSync
const JsUtils = require('./JsUtils')
var merge = require('deepmerge')

var currentPhase = 'default'
var countSuccessCommands = {}
var countFailCommands = {}
var countCommands = {}
var executedAreas = {}

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

const loadYAML = (filename) => {
    var result = {}
    try {
        result = yaml.safeLoad(fs.readFileSync(filename, 'utf8'))
    } catch (e) {
        logger.error(e)
    }
    return result
}

const initByObject = ({ufpMakeDefinition, options}) => {
    init({
        ufpMakeDefinition,
        options
    })
    processUfpMakeDefinition({
        ufpMakeDefinition,
        options
    })
}

const initByConfigFile = ({fileName, options}) => {
    logger.info('Using config file', fileName)
    var ufpMakeDefinition
    if (fs.existsSync(fileName)) {
        ufpMakeDefinition = loadYAML(fileName)
        initByObject({
            ufpMakeDefinition,
            options
        })
    } else {
        throw new Error('YML Config not found')
    }
}

const init = ({ufpMakeDefinition}) => {
    logger.info(ufpMakeDefinition)
    // init stats
    Object.keys(ufpMakeDefinition.tasks)
        .map((task) => {
            logger.debug('Registering task', task)
            countCommands[task] = 0
            countFailCommands[task] = 0
            countSuccessCommands[task] = 0
        })

    Object.keys(ufpMakeDefinition.targets)
        .map((target) => {
            logger.debug('Registering target', target)
        })
}
const replaceVars = ({string, values}) => {
    var result = string
    Object.keys(values)
        .map((key) => {
            result = result.replace('${' + key + '}', values[key])
        })
    return result
}

const handleError = ({err, options}) => {
    countFailCommands[currentPhase]++
    //    logger.error('Execution failedxxx', err)
    logger.debug('stderr:\n', err.stderr.toString())
    logger.error('stdout:\n', err.stdout.toString())
    // logger.error('Execution failed', err)
    if (!options.FORCE) {
        throw new Error('exiting, use --FORCE to continue on fail')
    } else {
        logger.warn('Continuing build although step failed!')
    }
}

const executeCommandArea = ({command, options}) => {
    if (typeof command === 'string' || command instanceof String) {
        executeCommand({
            command,
            options
        })
    } else if (Array.isArray(command)) {
        command.map((command) => executeCommandArea({
            command,
            options
        }))
    } else {
        logger.mark('Starting:', command.name)
        const hrstart = process.hrtime()
        logger.info(command.description)
        var dependsOnResult = {
            reasons: [],
            isValid: true
        }
        if (command.dependsOn) {
            dependsOnResult = isPhaseValid(command.dependsOn)
        }

        if (dependsOnResult.isValid) {
            if (command.commands && command.commands.map) {
                command.commands.map((command) => executeCommandArea({
                    command,
                    options
                }))
            }
        } else {
            logger.mark('Skipping %s because failed/not started', command.name, dependsOnResult.reasons)
        }

        const hrend = process.hrtime(hrstart)
        logger.mark('Finished: %s in %d.%dms', command.name, ...hrend)
    }
}
const printStats = ({countCommands, countFailCommands, executedAreas}) => {
    Object.keys(countCommands)
        .map((key) => {
            if (countFailCommands[key] > 0) {
                logger.mark('%d of %d failed for: [%s]', countFailCommands[key], countCommands[key], key)
            } else if (!executedAreas[key]) {
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
            if (countCommands[key] === 0 || countFailCommands[key] > 0) {
                isPhaseValid = false
                failReasons.push(key)
            }
        })
    } else {
        if (countCommands[phases] === 0 || countFailCommands[phases] > 0) {
            isPhaseValid = false
            failReasons.push(phases)
        }
    }
    return {
        reasons: failReasons,
        isValid: isPhaseValid
    }
}

const executeCommand = ({command, options}) => {
    countCommands[currentPhase]++
    const commandNew = replaceVars({
        string: command,
        values: options.VARIABLES
    })
    try {
        logger.info('EXEC [', commandNew, ']')
        const output = execSync(commandNew, {
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe']
        })

        logger.info('END [ ', commandNew, '] ')

        logger.debug('stdout was:')
        logger.debug(output.toString())
        countSuccessCommands[currentPhase]++
    } catch (err) {
        logger.error('FAIL [', commandNew, ']')
        handleError({
            err,
            options
        })
    }
}

const processTarget = ({ufpMakeDefinition, theTarget, options}) => {
    logger.debug('Target Definition is', theTarget)

    theTarget.map((target) => {
        logger.info('Proccessing target', target)
        // check if target is another target or a task
        if (ufpMakeDefinition.targets[target]) {
            logger.debug('Target is referencing another target', target)
            logger.debug('Target is referencing another target', ufpMakeDefinition)
            logger.debug('Target is referencing another target', ufpMakeDefinition.targets['production'])
            processTarget({
                ufpMakeDefinition,
                theTarget: ufpMakeDefinition.targets[target],
                options
            })
        } else if (ufpMakeDefinition.tasks[target]) {
            logger.debug('Proccessing task target', target)
            currentPhase = target
            executedAreas[target] = true
            executeCommandArea({
                command: ufpMakeDefinition.tasks[target],
                options
            })
        }
    })
}
const processUfpMakeDefinition = ({ufpMakeDefinition, options}) => {
    logger.debug('Processing', ufpMakeDefinition)
    //    logger.debug('Options ', _options)
    try {
        var theTarget = ufpMakeDefinition.targets[options.TARGET]
        if (theTarget === undefined) {
            theTarget = ufpMakeDefinition.tasks[options.TARGET]
            if (theTarget === undefined) {
                logger.mark('Target/Task not found', options.TARGET)
            } else {
                currentPhase = options.TARGET
                executeCommandArea({
                    command: theTarget,
                    options
                })
            }
        } else {
            currentPhase = options.TARGET
            processTarget({
                ufpMakeDefinition,
                theTarget,
                options
            })
        }
    } catch (e) {
        logger.error(e.message)
        logger.debug(e)
    }

    printStats({
        countFailCommands,
        countCommands,
        executedAreas
    })
    logger.mark('finished')
}
module.exports = {

    makeFile: ({
        fileName = JsUtils.throwParam('Filename required for makeFile(), expecting a parameter object'),
        options = defaultOptions
    } = JsUtils.throwParam('parameters object required for makeFile()')) => {
        logger.mark('using', fileName)
        const optionsFinal = merge(defaultOptions, options)

        if (optionsFinal) {
            logger.debug('Options are:', optionsFinal)
        }

        initByConfigFile({
            fileName,
            options: optionsFinal
        })
    },
    make: ({ufpMakeDefinition = JsUtils.throwParam('ufpMakeDefinition required for make(), expecting a parameter object'), options} = {}) => {

    }

}
