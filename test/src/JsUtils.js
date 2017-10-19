const JsUtils = require('../../src/JsUtils')

const expect = require('chai').expect
describe('JsUtils', function () {

    it('should exist', function () {
        expect(JsUtils).to.exist
    });

    it('.throwParam should exist', function () {
        expect(JsUtils.throwParam).to.exist
    });

    it('.throwParam() should throw error', function () {
        expect(() => JsUtils.throwParam('test'))
            .to
            .throw('test')
    });
});