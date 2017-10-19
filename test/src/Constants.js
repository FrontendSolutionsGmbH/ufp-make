const Constants = require('../../src/Constants')

const expect = require('chai').expect
describe('Constants',()=>{
    it('should exist',()=>{
        expect(Constants).to.exist
    })

    it('.MAKE_OPTIONS should exist',()=>{
        expect(Constants.MAKE_OPTIONS).to.exist
    })

    it('.YAML_FILENAME should exist',()=>{
        expect(Constants.YAML_FILENAME).to.exist
    })

    it('.YAML_FILENAME should be equal to ufp-make.yml',()=>{
        expect(Constants.YAML_FILENAME)
            .to
            .equal('ufp-make.yml')
    })
})
