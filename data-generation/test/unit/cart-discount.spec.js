const { expect } = require('chai')
const { generateCartDiscounts } = require('../../src/cart-discounts/importer')

const CommercetoolsMock = require('./commercetools-mock')

describe('::cart discounts::', () => {
  const ctMock = new CommercetoolsMock()
  afterEach(() => {
    ctMock.clear()
  })

  describe('::should skip::', () => {
    it('when config is not set', async () => {
      ctMock.getCustomObject('')
      const { skip } = await generateCartDiscounts()
      expect(skip).to.be.true
    })

    it('when config is inactive', async () => {
      ctMock.getCustomObject({ cartDiscounts: { active: false } })
      const { skip } = await generateCartDiscounts()
      expect(skip).to.be.true
    })

    it('when appliesToAllCarts amount is greater than 100', async () => {
      const value = {
        cartDiscounts: {
          appliesToAllCarts: {
            amount: 101,
            cartDiscountDrafts: [
              {
                value: {
                  type: 'relative',
                  permyriad: 1000,
                },
                cartPredicate: '1 = 1',
                target: {
                  type: 'lineItems',
                  predicate:
                    'attributes.colors contains all ("black", "white")',
                },
              },
            ],
          },
        },
      }

      ctMock.getCustomObject(value)
      const { skip } = await generateCartDiscounts()
      expect(skip).to.be.true
    })
  })

  it('should create all cart discounts', async () => {
    const value = {
      cartDiscounts: {
        requiresDiscountCode: {
          amount: 10,
          cartDiscountDrafts: [
            {
              isActive: true,
              value: {
                type: 'relative',
                permyriad: 3000,
              },
              cartPredicate: '1 = 1',
              target: {
                type: 'lineItems',
                predicate: '1 = 1',
              },
            },
          ],
        },
        appliesToAllCarts: {
          amount: 10,
          cartDiscountDrafts: [
            {
              value: {
                type: 'relative',
                permyriad: 1000,
              },
              cartPredicate: '1 = 1',
              target: {
                type: 'lineItems',
                predicate: 'attributes.colors contains all ("black", "white")',
              },
            },
          ],
        },
      },
    }
    ctMock.getCustomObject(value)
    ctMock.createResource('cart-discounts')

    const { created } = await generateCartDiscounts()
    expect(created).to.equal(20)
  })

  it('should fail after max retries', async () => {
    const value = {
      cartDiscounts: {
        requiresDiscountCode: {
          amount: 10,
          cartDiscountDrafts: [
            {
              isActive: true,
              value: {
                type: 'relative',
                permyriad: 3000,
              },
              cartPredicate: '1 = 1',
              target: {
                type: 'lineItems',
                predicate: '1 = 1',
              },
            },
          ],
        },
        appliesToAllCarts: {
          amount: 10,
          cartDiscountDrafts: [
            {
              value: {
                type: 'relative',
                permyriad: 1000,
              },
              cartPredicate: '1 = 1',
              target: {
                type: 'lineItems',
                predicate: 'attributes.colors contains all ("black", "white")',
              },
            },
          ],
        },
      },
    }
    ctMock.getCustomObject(value)
    ctMock.returnBadRequest('cart-discounts')

    try {
      await generateCartDiscounts()
      expect.fail('should fail after max retries')
    } catch (e) {
      expect(e.statusCode).to.equal(400)
    }
  })
})
