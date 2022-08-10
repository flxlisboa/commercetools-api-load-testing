const { expect } = require('chai')
const {
  deleteCustomObject,
  createOrUpdateCustomObject,
  deleteAllCustomers,
} = require('./test-utils')
const { generateCustomers } = require('../../src/customers/importer')

describe('::customers::', () => {
  beforeEach(async () => {
    await cleanup()
  })

  after(async () => {
    await cleanup()
  })

  async function cleanup() {
    await Promise.all([deleteAllCustomers(), deleteCustomObject()])
  }

  it('should generate the customers successfully', async () => {
    const config = {
      customers: {
        amount: 10,
      },
    }

    await createOrUpdateCustomObject(config)

    const { created } = await generateCustomers(3)
    expect(created).to.equal(10)
  })
})
