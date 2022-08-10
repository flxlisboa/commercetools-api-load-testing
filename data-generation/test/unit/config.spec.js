const { expect } = require('chai')
const {
  initMockEnvVariables,
  deleteMockEnvVariables,
} = require('./mock-default-config')

describe('::config::', () => {
  beforeEach(() => {
    deleteMockEnvVariables()
  })

  after(() => {
    // restore env variables
    initMockEnvVariables()
  })

  it('when config is provided, it should load correctly', () => {
    process.env.CTP_PROJECT_KEY = 'projectKey'
    process.env.CTP_CLIENT_ID = 'clientId'
    process.env.CTP_CLIENT_SECRET = 'clientSecret'
    process.env.CTP_API_URL = 'hostUrl'
    process.env.CTP_AUTH_URL = 'authUrl'
    process.env.LOG_LEVEL = 'debug'

    const config = requireUncached('../../src/config')

    expect(config.getClientConfig()).to.eql({
      projectKey: 'projectKey',
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      apiUrl: 'hostUrl',
      authUrl: 'authUrl',
    })
    expect(config.getLogLevel()).to.eql('debug')
  })

  it('when some values are not provided, it should provide default values', () => {
    process.env.CTP_PROJECT_KEY = 'projectKey'
    process.env.CTP_CLIENT_ID = 'clientId'
    process.env.CTP_CLIENT_SECRET = 'clientSecret'

    const config = requireUncached('../../src/config')

    expect(config.getClientConfig()).to.eql({
      projectKey: 'projectKey',
      clientId: 'clientId',
      clientSecret: 'clientSecret',
      apiUrl: 'https://api.europe-west1.gcp.commercetools.com',
      authUrl: 'https://auth.europe-west1.gcp.commercetools.com',
    })
    expect(config.getLogLevel()).to.eql('info')
  })

  it('when client configuration is not provided, it should throw error', () => {
    process.env.CTP_PROJECT_KEY = 'projectKey'
    process.env.CTP_CLIENT_ID = 'clientId'

    try {
      requireUncached('../../src/config')
      expect.fail('This test should throw an error, but it did not')
    } catch (e) {
      expect(e.message).to.contain(
        'Please add the commercetools api client configuration'
      )
    }
  })

  function requireUncached(module) {
    delete require.cache[require.resolve(module)]
    // eslint-disable-next-line global-require,import/no-dynamic-require
    return require(module)
  }
})
