const Constants = require('../../src/Constants')

const expect = require('chai').expect
describe('Constants', function () {
    it('should exist', function () {
        expect(Constants).to.exist
    })

    it('.MAKE_OPTIONS should exist', function () {
        expect(Constants.MAKE_OPTIONS).to.exist
    })

    it('.YAML_FILENAME should exist', function () {
        expect(Constants.YAML_FILENAME).to.exist
    })

    it('.YAML_FILENAME should be equal to ufp-make.yml', function () {
        expect(Constants.YAML_FILENAME)
            .to
            .equal('ufp-make.yml')
    })
})
