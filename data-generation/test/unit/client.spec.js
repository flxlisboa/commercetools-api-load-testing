const { expect } = require('chai')
const { apiRoot } = require('../../src/client')

describe('commercetools client', () => {
  it('should return the same apiRoot for different calls', async () => {
    expect(apiRoot()).to.equal(apiRoot())
  })
})
