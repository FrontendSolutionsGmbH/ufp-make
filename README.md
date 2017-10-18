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

    phases:
        [Array of phase Names]

    [phaseName]:
        [Array of commands]

the command structure inside the [phaseName] definition is as follows:

a command can either be:

    command: a single cli command

a command object with name and description

    command:
        name: theCommandName
        description: theCommandDescription outputed on loglevel INFO
        command: a single cli command

or a collection of commands

    command:
        name: theCommandName
        description: theCommandDescription outputed on loglevel INFO
        commands: [array of commands]
