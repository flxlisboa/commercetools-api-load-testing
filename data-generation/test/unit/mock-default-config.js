function initMockEnvVariables() {
  process.env.CTP_PROJECT_KEY = 'projectKey'
  process.env.CTP_CLIENT_ID = 'clientId'
  process.env.CTP_CLIENT_SECRET = 'clientSecret'
  process.env.CTP_API_URL = 'https://api.europe-west1.gcp.commercetools.com'
  process.env.CTP_AUTH_URL = 'https://auth.europe-west1.gcp.commercetools.com'
  process.env.LOG_LEVEL = 'debug'
  process.env.CONCURRENCY = '10'
}

function deleteMockEnvVariables() {
  delete process.env.CTP_PROJECT_KEY
  delete process.env.CTP_CLIENT_ID
  delete process.env.CTP_CLIENT_SECRET
  delete process.env.CTP_API_URL
  delete process.env.CTP_AUTH_URL
  delete process.env.LOG_LEVEL
  delete process.env.CONCURRENCY
}

initMockEnvVariables()

module.exports = {
  initMockEnvVariables,
  deleteMockEnvVariables,
}
