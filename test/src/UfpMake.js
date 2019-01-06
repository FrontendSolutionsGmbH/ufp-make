const UfpMake = require('../../src/UfpMake')
const expect = require('chai').expect

describe('UfpMake', () => {
    it('should exist', () => {
        expect(UfpMake).to.exist
    })

    it('.make should exist', () => {
        expect(UfpMake.make).to.exist
    })

    it('.make() should throw', () => {
        expect(() => UfpMake.make()).to.throw('required')
    })

    it('.make({}) should throw', () => {
        expect(() => UfpMake.make({})).to.throw('required')
    })

    it('.makeFile should exist', () => {
        expect(UfpMake.makeFile).to.exist
    })

    it('.makeFile() should throw', () => {
        expect(() => UfpMake.makeFile()).to.throw('required')
    })

    it('.makeFile({}) should throw', () => {
        expect(() => UfpMake.makeFile({})).to.throw('required')
    })

    it('.makeFile({wrongValue...}) should throw', () => {
        expect(() => UfpMake.makeFile({ wrongField: 'wrongValue' })).to.throw('required')
    })

    it('.makeFile({ fileName...}) should work if file exists', () => {
        expect(() => UfpMake.makeFile({ fileName: 'wrongValue' })).to.throw('YML Config not found')
    })

    it('.makeFile({ fileName: "defaultFilename"}) should work if file exists', () => {
        expect(() => UfpMake.makeFile({
            fileName: 'default/ufp-make.yml',
            options: { TARGET: 'xxx' }
        })).to.not.throw('YML Config not found')
    })
})
