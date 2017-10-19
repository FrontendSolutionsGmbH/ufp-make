const yaml = require('js-yaml')
const logger = require('../src/Logger')('ufp-make')
const fs = require('fs')
const execSync = require('child_process').execSync
const JsUtils = require('./JsUtils')
let merge = require('deepmerge')

let currentPhase = 'default'

let countSuccessCommands = {}
let countFailCommands = {}
let countCommands = {}
let executedAreas = {}

/**
 * we want to provide a set of variables and default option
 * as core feature of the build mechanics, so version, api_type, theme, node_env
 * are the ones most used for building in the continous pipeline... *
 *
 * @type {{TARGET: string, FORCE: boolean, VARIABLES: {UFP_VERSION: string, UFP_API_TYPE: string, UFP_THEME: string, UFP_NODE_ENV: string}}}
 */
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

/**
 * utility wrapper for yaml loader
 * @param filename
 * @returns {{}}
 */
const loadYAML = (filename) => {
    let result = {}
    try {
        result = yaml.safeLoad(fs.readFileSync(filename, 'utf8'))
    } catch (e) {
        logger.error(e)
    }
    return result
}

/**
 * core api entry point here is the start of the processing of a config
 * object
 *
 * @param ufpMakeDefinition
 * @param options
 */
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

/**
 * loads a specific file and parses content as yml
 * and executes the parsing
 * @param fileName
 * @param options
 */
const initByConfigFile = ({fileName, options}) => {
    logger.info('Using config file', fileName)
    let ufpMakeDefinition
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

/**
 * resets the *basic* counters for statistics
 * @param ufpMakeDefinition
 */
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
/**
 * template utility string method replacing template string variable by hand
 * @param string
 * @param values
 * @returns {*}
 */
const replaceVars = ({string, values}) => {
    let result = string
    Object.keys(values)
        .map((key) => {
            result = result.replace('${' + key + '}', values[key])
        })
    return result
}
/**
 * we want to control termination of program during build if explicitly
 * set to NOT fail just log the errors but with most information possible
 * @param err
 * @param options
 */
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

/**
 * a command area can be of type string, array, commandArea
 * a commandarea is providing more information that is outputed
 * throughet the execution
 *
 * a single string command is forwarded to the executeCommand
 *
 * if its an array each entry is forwarded to itSelf
 *
 * in fact this method does most of the work determining what to do
 * and features child areas as well
 *
 * @param command - string,array,object
 * @param options
 */
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
        let dependsOnResult = {
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
/**
 *
 * basic statistics output for end of program
 *
 * @param countCommands
 * @param countFailCommands
 * @param executedAreas
 */
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
/**
 * a (for now) basic determination if a task has been (succsesfully) executed either it
 * has not even started or executed with errors which both leads to a
 *
 * return object contains reason for failing by naming the failed tasks and
 * if all ok result.isValid=true
 *
 * @param phases
 * @returns {{reasons: Array, isValid: boolean}}
 */
const isPhaseValid = (phases) => {
    let isPhaseValid = true
    let failReasons = []
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
/**
 * the execution of a single cli command string using execSync from the node
 * library options flag if any exception shall lead to termination of program
 *
 * @param command
 * @param options
 */
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

/**
 * iterate through a list of strings and forward to processTarget if its another target
 * or process task (commandArea) otherwise
 *
 * @param ufpMakeDefinition
 * @param theTarget list of strings for targets/tasks
 * @param options
 */
const processTarget = ({ufpMakeDefinition, theTarget, options}) => {
    logger.debug('Target Definition is', theTarget)

    theTarget.map((target) => {
        logger.info('Proccessing target', target)
        // check if target is another target or a task
        if (ufpMakeDefinition.targets[target]) {
            logger.debug('Target is referencing another target', target)
            logger.debug('Target is referencing another target', ufpMakeDefinition)
            logger.debug('Target is referencing another target', ufpMakeDefinition.targets[target])
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
/**
 * this method is meant to process the full blow makeDefinition
 * which is parsing the object consisting of targets/task objects
 *
 * the tasks define single actions
 *
 * the targets are the main entry point listing tasks or targets to
 * be executed in that order
 *
 * @param ufpMakeDefinition
 * @param options
 */
const processUfpMakeDefinition = ({ufpMakeDefinition, options}) => {
    logger.debug('Processing', ufpMakeDefinition)
    //    logger.debug('Options ', _options)
    try {
        let theTarget = ufpMakeDefinition.targets[options.TARGET]
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

/**
 * the module exports which is its api
 *
 * @type {{
 *
 * makeFile: ((p1?:{fileName?: *, options?: *})),
 *
 * makefile is meant to be used as api call of a config filename.yml
 * options object is usually parsed commandline but can be filled as liked (see readme for values)
 *
 * make: ((p1?:{ufpMakeDefinition?: *, options: *}))}}
 *
 * make is the object api call of a full blown UfpMakeDefinition (see readme for syntax)
 * options object is usually parsed commandline but can be filled as liked (see readme for values)
 *
 */
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
        initByObject({
            ufpMakeDefinition,
            options
        })
    }

}
