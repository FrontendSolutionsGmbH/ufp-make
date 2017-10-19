const YamlLoader = require('../../src/YamlLoader')
const expect = require('chai').expect

describe('YamlLoader', () => {
    it('should exist', () => {
        expect(YamlLoader).to.exist
    })

    it('should exist', () => {
        expect(YamlLoader.loadYAML).to.exist
    })
})
