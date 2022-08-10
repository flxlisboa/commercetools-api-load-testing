const fetch = require('node-fetch')
const { createClient } = require('@commercetools/sdk-client')
const {
  createAuthMiddlewareForClientCredentialsFlow,
} = require('@commercetools/sdk-middleware-auth')
const {
  createUserAgentMiddleware,
} = require('@commercetools/sdk-middleware-user-agent')
const { createHttpMiddleware } = require('@commercetools/sdk-middleware-http')
const { createQueueMiddleware } = require('@commercetools/sdk-middleware-queue')
const { createApiBuilderFromCtpClient } = require('@commercetools/platform-sdk')
const { getClientConfig, getConcurrency } = require('./config')

const packageJson = require('../package.json')

function createCtpClient({
  clientId,
  clientSecret,
  projectKey,
  authUrl,
  apiUrl,
}) {
  const authMiddleware = createAuthMiddlewareForClientCredentialsFlow({
    host: authUrl,
    projectKey,
    credentials: {
      clientId,
      clientSecret,
    },
    fetch,
  })

  const userAgentMiddleware = createUserAgentMiddleware({
    libraryName: packageJson.name,
    libraryVersion: packageJson.version,
    contactUrl: packageJson.homepage,
    contactEmail: packageJson.author.email,
  })

  const httpMiddleware = createHttpMiddleware({
    maskSensitiveHeaderData: true,
    host: apiUrl,
    enableRetry: true,
    fetch,
  })

  const queueMiddleware = createQueueMiddleware({
    concurrency: getConcurrency(),
  })

  return createClient({
    middlewares: [
      authMiddleware,
      userAgentMiddleware,
      httpMiddleware,
      queueMiddleware,
    ],
  })
}

let ctpClient
function getCtpClient() {
  if (ctpClient) return ctpClient

  const clientConfig = getClientConfig()
  ctpClient = createCtpClient(clientConfig)
  return ctpClient
}

/*
Added a ticket for the support the batching with process in commercetools-sdk-typescript project
see: https://jira.commercetools.com/servicedesk/customer/portal/1/SUPPORT-12178
*/
function fetchWithBatches(uri, callback) {
  const requestOptions = {
    uri,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }
  return getCtpClient().process(
    requestOptions,
    (data) => callback(data.body.results),
    { accumulate: false }
  )
}

let apiRoot
function getApiRoot() {
  if (apiRoot) return apiRoot

  const { projectKey } = getClientConfig()
  apiRoot = createApiBuilderFromCtpClient(getCtpClient()).withProjectKey({
    projectKey,
  })
  return apiRoot
}

module.exports = {
  apiRoot: () => getApiRoot(),
  fetchWithBatches,
}
