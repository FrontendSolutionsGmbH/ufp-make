# UFP Make

Cli Batch execution, inspired by gitlab-ci.yml but for workstations and non-gitlab environments

## Remark

Build tools are around since ages, recent years included grunt and gulp which then where abandoned
in favour of npm build script management. In continous integration environments there is more to
do than just execute a single command. generally there is a bunch of commands that needs to be executed

inspired by the gitlab-ci.yml format the ufp-make strips of the docker-image configuration and is just
a collection of shell commands (defined in package.json )


## Installation

install global using

    npm install ufp-make -g

## ufp-make.yml

    alias:
        key: value
    targets:
        pre: [array of targets or tasks]
        post: [array of targets or tasks]
        [targetName]: [Array of targets or tasks]
    tasks:        
        [taskName]: [Array of Commands]

the command structure inside the [taskName] definition is as follows:

a command can either be:

    command: a single cli command

or a collection of commands

    command:
        cwd: [current working directory state machine, will not be reseted after command]
        name: theCommandName
        description: theCommandDescription outputed on loglevel INFO
        commands: [array of commands]

## Api

    const ufpApi = require('ufp-api')

the api offers 2 methods:

    ufpApi.makeFile({fileName,options})

    ufpApi.make({ufpMakeDefinition,options})



## Cli

    > ufp-make --help

    Commands:
    {
      default     build target default
      develop     build target develop
      production  build target production
      lint        execute task lint
      test        execute task test
      build       execute task build
    } parsed from local ufp-make.yml

    Options:
      --help              Show help                                        [boolean]
      --version           Show version number                              [boolean]
      --FORCE             allow fail of single steps      [boolean] [default: false]
      --CLEAN             rimraf build folders before start
                                                          [boolean] [default: false]
      --UFP_VERSION, -v   project specific version,
                          provided as UFP_VERSION environment variable
                                                    [default: "ufp-version-default"]
      --UFP_API_TYPE, -a  api type,
                          provided as UFP_API_TYPE environment variable
                                         [choices: "live", "mock"] [default: "live"]
      --UFP_NODE_ENV, -n  node environment value,
                          provided as NODE_ENV environment variable
              [choices: "production", "development", "test"] [default: "production"]
      --UFP_THEME, -t     theming ,
                          provided as UFP_THEME environment variable
                                                                [default: "default"]
      --LOG_LEVEL, -l     Log Level following log4j, higher levels include lower
                          ones
      [choices: "ERROR", "WARN", "INFO", "DEBUG", "TRACE", "ALL"] [default: "ERROR"]
      --CONFIG, -c        Configuration file              [default: "ufp-make.json"]


## Known Limitation of v0.1.x

the auto build of dependant tasks is not implemented
