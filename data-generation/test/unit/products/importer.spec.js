const { expect } = require('chai')
const { generateProducts } = require('../../../src/products/importer')

const CommercetoolsMock = require('../commercetools-mock')
const dataGenerationCustomObject = require('../../resources/data-generation-custom-object.json')

describe('::importer::', () => {
  const ctMock = new CommercetoolsMock()
  afterEach(() => {
    ctMock.clear()
  })

  it('should create all products', async () => {
    const config = {
      products: {
        amount: 10,
        variants: {
          max: 3,
          min: 3,
          prices: {
            randomizedPrices: {
              min: 1,
              max: 1,
              minCentAmount: 0,
              maxCentAmount: 1000,
            },
          },
        },
      },
    }

    ctMock.getCustomObject(config)
    let lastSku = ''
    ctMock.createResource('products', (requestBody) => {
      lastSku = requestBody.variants[requestBody.variants.length - 1].sku
    })
    ctMock.queryResource('product-projections', [
      {
        masterVariant: { sku: '30' },
        variants: [{ sku: '31' }, { sku: '32' }],
      },
    ])
    ctMock.queryResource('product-types', [{ id: 1, attributes: [] }])
    ctMock.queryResource('tax-categories', [{ id: 1 }])

    const { created } = await generateProducts()
    expect(created).to.equal(10)
    expect(lastSku).to.equal('62')
  })

  it('should throw error when no product type is present', async () => {
    try {
      ctMock.getCustomObject(dataGenerationCustomObject)
      ctMock.queryResource('product-types', [])
      await generateProducts()
      expect.fail(
        'Generate product should fail when no product type is present'
      )
    } catch (e) {
      expect(e.message).to.equal(
        'Please create at least 1 product type in the project!'
      )
    }
  })

  it('should throw error when no tax category is present', async () => {
    try {
      ctMock.getCustomObject(dataGenerationCustomObject)
      ctMock.queryResource('product-types', [{}])
      ctMock.queryResource('tax-categories', [])
      await generateProducts()
      expect.fail(
        'Generate product should fail when no tax category is present'
      )
    } catch (e) {
      expect(e.message).to.equal(
        'Please create at least 1 tax category in the project!'
      )
    }
  })
})
