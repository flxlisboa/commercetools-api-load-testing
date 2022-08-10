const { expect } = require('chai')
const {
  deleteCustomObject,
  createOrUpdateCustomObject,
  deleteAllProductTypes,
  deleteAllProducts,
  ensureTaxCategory,
} = require('./test-utils')
const { generateProductTypes } = require('../../src/product-types/importer')
const { generateProducts } = require('../../src/products/importer')
const dataGenerationCustomObject = require('../resources/data-generation-custom-object.json')

describe('::products::', () => {
  beforeEach(async () => {
    await ensureTaxCategory()
    await cleanup()
  })

  afterEach(async () => {
    await cleanup()
  })

  async function cleanup() {
    await deleteAllProducts()
    await Promise.all([deleteAllProductTypes(), deleteCustomObject()])
  }

  it('should generate the products successfully', async () => {
    await createOrUpdateCustomObject(dataGenerationCustomObject)

    await generateProductTypes()
    const { created } = await generateProducts(3, 2)
    expect(created).to.equal(7)
  })
})
