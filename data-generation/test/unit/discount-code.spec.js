const { expect } = require('chai')
const { generateDiscountCodes } = require('../../src/discount-codes/importer')

const CommercetoolsMock = require('./commercetools-mock')

describe('::discount codes::', () => {
  const ctMock = new CommercetoolsMock()
  afterEach(() => {
    ctMock.clear()
  })

  describe('::should skip::', () => {
    it('when config is not set', async () => {
      ctMock.getCustomObject('')
      const { skip } = await generateDiscountCodes()
      expect(skip).to.be.true
    })

    it('when config is inactive', async () => {
      ctMock.getCustomObject({ discountCodes: { active: false } })
      const { skip } = await generateDiscountCodes()
      expect(skip).to.be.true
    })

    it('when randomizedDiscountCodes is not set', async () => {
      ctMock.getCustomObject({ discountCodes: {} })
      const { skip } = await generateDiscountCodes()
      expect(skip).to.be.true
    })
  })

  it('should create all discount codes', async () => {
    const config = {
      discountCodes: {
        randomizedDiscountCodes: {
          amount: 10,
          maxApplicationsPerCustomer: 3,
        },
      },
    }

    ctMock.getCustomObject(config)
    ctMock.queryResource('cart-discounts', [{ id: 1 }])
    ctMock.queryResource('discount-codes', [{ code: '20' }])
    let lastDiscountCode = ''
    ctMock.createResource('discount-codes', (requestBody) => {
      lastDiscountCode = requestBody.code
    })

    const { created } = await generateDiscountCodes()
    expect(created).to.equal(10)
    expect(lastDiscountCode).to.equal('30')
  })

  it('should throw error when no cart discount is present', async () => {
    try {
      const config = {
        discountCodes: {
          randomizedDiscountCodes: {
            amount: 20,
            maxApplicationsPerCustomer: 3,
          },
        },
      }
      ctMock.getCustomObject(config)
      ctMock.queryResource('cart-discounts', [])
      await generateDiscountCodes()
      expect.fail(
        'Generate discount code should fail when no cart discount is present'
      )
    } catch (e) {
      expect(e.message).to.equal(
        'Please create at least 1 cart discount in the project!'
      )
    }
  })

  it('should fail after max retries', async () => {
    const config = {
      discountCodes: {
        randomizedDiscountCodes: {
          amount: 20,
          maxApplicationsPerCustomer: 3,
        },
      },
    }
    ctMock.getCustomObject(config)
    ctMock.queryResource('cart-discounts', [{ id: 1 }])
    ctMock.queryResource('discount-codes', [])
    ctMock.returnBadRequest('discount-codes')

    try {
      await generateDiscountCodes()
      expect.fail('should fail after max retries')
    } catch (e) {
      expect(e.statusCode).to.equal(400)
    }
  })
})
