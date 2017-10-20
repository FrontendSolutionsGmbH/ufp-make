const yaml = require('js-yaml')
const fs = require('fs')

const loadYAML = (filename) => {
    return yaml.safeLoad(fs.readFileSync(filename, 'utf8'))
}

module.exports = {

    loadYAML

}
