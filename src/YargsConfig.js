const yargs = require('yargs')
const YamlLoader = require('./YamlLoader')
const Constants = require('./Constants')
const path = require('path')

const fs = require('fs')
yargs.version('1.0.0')

/**
 * defines the application wide command line interface
 */

Object.keys(Constants.MAKE_OPTIONS)
      .map((key) => {
          yargs.option(key, Constants.MAKE_OPTIONS[key])
      })

var pre
// Attempt to load the config file and parse the targets out of it
if (fs.existsSync(process.argv.CONFIG)) {
    pre = YamlLoader.loadYAML(yargs.argv.CONFIG)
}
if (fs.existsSync(path.join(process.cwd(), 'ufp-make.yml'))) {
    pre = YamlLoader.loadYAML(path.join(process.cwd(), 'ufp-make.yml'))
} else {
    pre = YamlLoader.loadYAML(path.join(__dirname, '../default/ufp-make.yml'))
}

// define yargs commands to directly execute a task/target
if (pre.targets) {
    Object.keys(pre.targets)
          .map((target) => {
              yargs.command(target, `build target ${target} `, {
                  TARGET: {default: target}
              })
          })
    Object.keys(pre.tasks)
          .map((target) => {
              yargs.command(target, `execute task ${target}`, {
                  TARGET: {default: target}
              })
          })
}

module.exports = yargs
