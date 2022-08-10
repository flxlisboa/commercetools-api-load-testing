function getClientConfig() {
  return {
    projectKey: process.env.CTP_PROJECT_KEY,
    clientId: process.env.CTP_CLIENT_ID,
    clientSecret: process.env.CTP_CLIENT_SECRET,
    apiUrl:
      process.env.CTP_API_URL ||
      'https://api.europe-west1.gcp.commercetools.com',
    authUrl:
      process.env.CTP_AUTH_URL ||
      'https://auth.europe-west1.gcp.commercetools.com',
  }
}

function getLogLevel() {
  return process.env.LOG_LEVEL || 'info'
}

function getConcurrency() {
  return parseInt(process.env.CONCURRENCY, 10) || 4
}

function loadAndValidateConfig() {
  const { projectKey, clientId, clientSecret } = getClientConfig()
  if (!projectKey || !clientId || !clientSecret)
    throw new Error(
      `Client configuration is not provided. Please add the commercetools api client configuration.`
    )
}

loadAndValidateConfig()

module.exports = {
  getClientConfig,
  getLogLevel,
  getConcurrency,
}
