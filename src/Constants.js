const UFP_API_TYPE = 'UFP_API_TYPE'
const UFP_VERSION = 'UFP_VERSION'
const UFP_NODE_ENV = 'UFP_NODE_ENV'
const UFP_THEME = 'UFP_THEME'
const UFP_FORCE = 'FORCE'
const UFP_CLEAN = 'CLEAN'
const LOG_LEVEL = 'LOG_LEVEL'

const API_TYPES = ['live', 'mock']
const NODE_ENVS = ['production', 'development', 'test']
const LOG_LEVELS = ['ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE', 'ALL']

module.exports = {
    YAML_FILENAME: 'ufp-make.yml',
    MAKE_OPTIONS: {
        [UFP_FORCE]: {
            boolean: true,
            describe: 'allow fail of single steps',
            default: false
        },
        [UFP_CLEAN]: {
            boolean: true,
            describe: 'rimraf build folders before start',
            default: false
        },
        [UFP_VERSION]: {
            describe: `project specific version, 
        provided as UFP_VERSION environment variable
`,
            default: 'ufp-version-default',
            alias: 'v'
        },
        [UFP_API_TYPE]: {
            describe: `api type, 
        provided as UFP_API_TYPE environment variable
`,
            default: API_TYPES[0],
            choices: API_TYPES,
            alias: 'a'
        },
        [UFP_NODE_ENV]: {
            describe: `node environment value, 
        provided as NODE_ENV environment variable
`,
            default: process.env[UFP_NODE_ENV] || NODE_ENVS[0],
            choices: NODE_ENVS,
            alias: 'n'
        },
        [UFP_THEME]: {
            describe: `theming , 
        provided as UFP_THEME environment variable
`,
            default: 'default',
            alias: 't'
        },
        [LOG_LEVEL]: {
            describe: 'Log Level following log4j, higher levels include lower ones',
            choices: LOG_LEVELS,
            default: LOG_LEVELS[0],
            alias: 'l'

        },
        'CONFIG': {
            describe: 'Configuration file',
            alias: 'c',
            default: 'ufp-make.yml'

        }
    }
}
