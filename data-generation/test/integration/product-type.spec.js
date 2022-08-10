const { expect } = require('chai')
const {
  deleteCustomObject,
  createOrUpdateCustomObject,
  deleteAllProductTypes,
  getAmountOfAttributesForAllProductTypes,
} = require('./test-utils')
const { generateProductTypes } = require('../../src/product-types/importer')
const dataGenerationCustomObject = require('../resources/data-generation-custom-object.json')

describe('::productTypes::', () => {
  beforeEach(async () => {
    await cleanup()
  })

  after(async () => {
    await cleanup()
  })

  async function cleanup() {
    await Promise.all([deleteAllProductTypes(), deleteCustomObject()])
  }

  it('should generate the product types successfully', async () => {
    await createOrUpdateCustomObject(dataGenerationCustomObject)

    const { created } = await generateProductTypes(3)
    expect(created).to.equal(5)

    const amountOfAttributes = await getAmountOfAttributesForAllProductTypes()
    expect(amountOfAttributes).to.have.lengthOf.above(0)
    const common =
      dataGenerationCustomObject.productTypes.commonAttributes.length
    const min =
      dataGenerationCustomObject.productTypes.randomizedAttributes.min + common
    const max =
      dataGenerationCustomObject.productTypes.randomizedAttributes.max + common
    amountOfAttributes.forEach((amount) => {
      expect(amount).to.not.be.below(min)
      expect(amount).to.not.be.above(max)
    })
  })
})
