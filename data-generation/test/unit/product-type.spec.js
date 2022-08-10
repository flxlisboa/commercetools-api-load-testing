const { expect } = require('chai')
const { generateProductTypes } = require('../../src/product-types/importer')

const CommercetoolsMock = require('./commercetools-mock')

describe('::productTypes::', () => {
  const ctMock = new CommercetoolsMock()
  afterEach(() => {
    ctMock.clear()
  })

  describe('::should skip::', () => {
    it('when config is not set', async () => {
      ctMock.getCustomObject('')
      const { skip } = await generateProductTypes()
      expect(skip).to.be.true
    })

    it('when config is inactive', async () => {
      ctMock.getCustomObject({ productTypes: { active: false } })

      const { skip } = await generateProductTypes()
      expect(skip).to.be.true
    })

    it('when min value is greater than max value for randomizedAttributes', async () => {
      const value = {
        productTypes: {
          amount: 1,
          randomizedAttributes: {
            min: 40,
            max: 30,
            attributeTypes: {
              lenum: {
                amount: 5,
                enumsAmount: 50,
              },
              enum: {
                amount: 10,
              },
            },
          },
          commonAttributes: [
            {
              name: 'att1',
              label: {
                'de-DE': 'att1',
              },
              isRequired: false,
              type: {
                name: 'ltext',
              },
              attributeConstraint: 'SameForAll',
              isSearchable: true,
              inputHint: 'MultiLine',
              displayGroup: 'Other',
            },
          ],
        },
      }
      ctMock.getCustomObject(value)

      const { skip } = await generateProductTypes()
      expect(skip).to.be.true
    })

    it('total sum of amount values are greater then max value', async () => {
      const value = {
        productTypes: {
          amount: 1,
          randomizedAttributes: {
            min: 10,
            max: 30,
            attributeTypes: {
              lenum: {
                amount: 20,
                enumsAmount: 50,
              },
              enum: {
                amount: 10,
              },
              text: {
                amount: 5,
              },
            },
          },
          commonAttributes: [
            {
              name: 'att1',
              label: {
                'de-DE': 'att1',
              },
              isRequired: false,
              type: {
                name: 'ltext',
              },
              attributeConstraint: 'SameForAll',
              isSearchable: true,
              inputHint: 'MultiLine',
              displayGroup: 'Other',
            },
          ],
        },
      }
      ctMock.getCustomObject(value)

      const { skip } = await generateProductTypes()
      expect(skip).to.be.true
    })
  })

  it('should create all attribute types', async () => {
    const value = {
      productTypes: {
        amount: 5,
        randomizedAttributes: {
          min: 15,
          max: 40,
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
            number: {
              amount: 1,
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
        commonAttributes: [
          {
            name: 'att1',
            label: {
              'de-DE': 'att1',
            },
            isRequired: false,
            type: {
              name: 'ltext',
            },
            attributeConstraint: 'None',
            isSearchable: true,
            inputHint: 'MultiLine',
            displayGroup: 'Other',
          },
        ],
      },
    }
    ctMock.getCustomObject(value)
    ctMock.createResource('product-types')

    const { created } = await generateProductTypes()
    expect(created).to.equal(5)
  })

  it('should create randomly when attributeTypes is not defined', async () => {
    const value = {
      productTypes: {
        amount: 5,
        randomizedAttributes: {
          min: 15,
          max: 40,
        },
        commonAttributes: [
          {
            name: 'att1',
            label: {
              'de-DE': 'att1',
            },
            isRequired: false,
            type: {
              name: 'ltext',
            },
            attributeConstraint: 'None',
            isSearchable: true,
            inputHint: 'MultiLine',
            displayGroup: 'Other',
          },
        ],
      },
    }
    ctMock.getCustomObject(value)
    ctMock.createResource('product-types')

    const { created } = await generateProductTypes()
    expect(created).to.equal(5)
  })

  it('should fail after max retries', async () => {
    const value = {
      productTypes: {
        amount: 5,
        randomizedAttributes: {
          min: 15,
          max: 40,
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
            number: {
              amount: 1,
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
        commonAttributes: [
          {
            name: 'att1',
            label: {
              'de-DE': 'att1',
            },
            isRequired: false,
            type: {
              name: 'ltext',
            },
            attributeConstraint: 'None',
            isSearchable: true,
            inputHint: 'MultiLine',
            displayGroup: 'Other',
          },
        ],
      },
    }
    ctMock.getCustomObject(value)
    ctMock.returnBadRequest('product-types')

    try {
      await generateProductTypes()
      expect.fail('should fail after max retries')
    } catch (e) {
      expect(e.statusCode).to.equal(400)
    }
  })
})
