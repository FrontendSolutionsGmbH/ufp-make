const JsUtils = require('../../src/JsUtils')

const expect = require('chai').expect
describe('JsUtils', () => {
    it('should exist', () => {
        expect(JsUtils).to.exist
    })

    it('.throwParam should exist', () => {
        expect(JsUtils.throwParam).to.exist
    })

    it('.throwParam() should throw error', () => {
        expect(() => JsUtils.throwParam('test'))
            .to
            .throw('test')
    })
})
