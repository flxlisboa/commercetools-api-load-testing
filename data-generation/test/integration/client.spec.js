const { expect } = require('chai')
const { apiRoot } = require('../../src/client')

describe('commercetools client', () => {
  it('should authenticate and fetch project information', async () => {
    const projectInfo = await apiRoot().get().execute()
    expect(projectInfo.statusCode).to.equal(200)
  })
})
