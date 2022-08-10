const { expect } = require('chai')
const { generateCustomers } = require('../../src/customers/importer')

const CommercetoolsMock = require('./commercetools-mock')

describe('::customers::', () => {
  const ctMock = new CommercetoolsMock()
  afterEach(() => {
    ctMock.clear()
  })

  describe('::should skip::', () => {
    it('when config is not set', async () => {
      ctMock.getCustomObject('')
      const { skip } = await generateCustomers()
      expect(skip).to.be.true
    })

    it('when config is inactive', async () => {
      ctMock.getCustomObject({ customers: { active: false } })
      const { skip } = await generateCustomers()
      expect(skip).to.be.true
    })

    it('when amount is not set', async () => {
      const value = {
        customers: {},
      }
      ctMock.getCustomObject(value)

      const { skip } = await generateCustomers()
      expect(skip).to.be.true
    })

    it('when amount is less than 1', async () => {
      const value = {
        customers: {
          amount: 0,
        },
      }
      ctMock.getCustomObject(value)

      const { skip } = await generateCustomers()
      expect(skip).to.be.true
    })
  })

  it('should create all customers', async () => {
    const value = {
      customers: {
        amount: 10,
      },
    }

    ctMock.getCustomObject(value)
    let lastCustomerKey = ''
    ctMock.createResource('customers', (requestBody) => {
      lastCustomerKey = requestBody.key
    })
    ctMock.queryResource('customers', [{ key: 'customer_12' }])

    const { created } = await generateCustomers()
    expect(created).to.equal(10)
    expect(lastCustomerKey).to.equal('customer_22')
  })

  it('should fail after max retries', async () => {
    const value = {
      customers: {
        amount: 20,
      },
    }
    ctMock.getCustomObject(value)
    ctMock.queryResource('customers', [])
    ctMock.returnBadRequest('customers')

    try {
      await generateCustomers()
      expect.fail('should fail after max retries')
    } catch (e) {
      expect(e.statusCode).to.equal(400)
    }
  })
})
