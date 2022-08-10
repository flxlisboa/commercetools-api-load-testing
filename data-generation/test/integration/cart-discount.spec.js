const { expect } = require('chai')
const {
  deleteCustomObject,
  createOrUpdateCustomObject,
  deleteAllProductTypes,
  deleteAllCartDiscounts,
  deleteAllDiscountCodes,
} = require('./test-utils')
const { generateProductTypes } = require('../../src/product-types/importer')
const { generateCartDiscounts } = require('../../src/cart-discounts/importer')
const lenumAttributeDefinition = require('../resources/lenumAttributeDefinition.json')

describe('::cart discounts::', () => {
  beforeEach(async () => {
    await cleanup()
  })

  after(async () => {
    await cleanup()
  })

  async function cleanup() {
    await Promise.all([deleteAllProductTypes(), deleteAllDiscountCodes()])
    await Promise.all([deleteAllCartDiscounts(), deleteCustomObject()])
  }

  it('should generate the cart discounts successfully', async () => {
    const config = {
      productTypes: {
        amount: 1,
        randomizedAttributes: {
          min: 10,
          max: 30,
          attributeTypes: {
            boolean: {
              amount: 1,
            },
            text: {
              amount: 2,
            },
            ltext: {
              amount: 1,
            },
            lenum: {
              amount: 5,
              enumsAmount: 50,
            },
            enum: {
              amount: 10,
              enumsAmount: 10,
            },
            money: {
              amount: 1,
            },
            date: {
              amount: 1,
            },
            time: {
              amount: 1,
            },
            datetime: {
              amount: 1,
            },
            set: {
              amount: 3,
            },
          },
        },
        commonAttributes: [lenumAttributeDefinition],
      },
      cartDiscounts: {
        requiresDiscountCode: {
          amount: 5,
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
            {
              isActive: true,
              value: {
                type: 'relative',
                permyriad: 1500,
              },
              cartPredicate: 'totalPrice > "10.00 EUR"',
              target: {
                type: 'lineItems',
                predicate: '1 = 1',
              },
            },
          ],
        },
        appliesToAllCarts: {
          amount: 5,
          cartDiscountDrafts: [
            {
              value: {
                type: 'relative',
                permyriad: 1000,
              },
              target: {
                type: 'lineItems',
                predicate:
                  'attributes.computer_1_chips_lenum_1 in ("sports_enum_3","alarm_enum_5")',
              },
            },
          ],
        },
      },
    }

    await createOrUpdateCustomObject(config)

    await generateProductTypes()

    const { created } = await generateCartDiscounts(3)
    expect(created).to.equal(10)
  })
})
