const YargsConfig = require('../../src/YargsConfig')
const expect = require('chai').expect

describe('YargsConfig', () => {
    it('should exist', () => {
        expect(YargsConfig).to.exist
    })

    it('yargs wrapping of parameters', () => {
        expect(YargsConfig.argv).to.have.own.property('FORCE')
        expect(YargsConfig.argv).to.have.own.property('CLEAN')
        expect(YargsConfig.argv).to.have.own.property('UFP_VERSION')
        expect(YargsConfig.argv).to.have.own.property('UFP_THEME')
        expect(YargsConfig.argv).to.have.own.property('LOG_LEVEL')
        expect(YargsConfig.argv).to.have.own.property('UFP_NODE_ENV')
        expect(YargsConfig.argv).to.have.own.property('CONFIG')
        expect(YargsConfig.argv).to.have.own.property('UFP_API_TYPE')
    })

})
