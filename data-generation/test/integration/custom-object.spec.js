const { expect } = require('chai')
const { fetchProductTypesConfig } = require('../../src/custom-object')
const testUtils = require('./test-utils')

describe('custom object configurations', () => {
  it('should fetch productTypes config', async () => {
    const value = {
      productTypes: {
        amount: 100,
      },
    }
    await testUtils.createOrUpdateCustomObject(value)

    const productTypeConfig = await fetchProductTypesConfig()
    expect(productTypeConfig).to.deep.equal(value.productTypes)
  })

  it('should throw exception when config is not set', async () => {
    await testUtils.deleteCustomObject()
    try {
      await fetchProductTypesConfig()
      expect.fail('This test should throw an error, but it did not')
    } catch (e) {
      expect(e.statusCode).to.equal(404)
    }
  })

  it('should return undefined when config is set but not set for the resource', async () => {
    const value = {
      products: {
        amount: 1000,
      },
    }
    await testUtils.createOrUpdateCustomObject(value)
    const productTypeConfig = await fetchProductTypesConfig()
    expect(productTypeConfig).to.equal(undefined)
  })
})
