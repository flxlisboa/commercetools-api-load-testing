export function getClientConfig() {
  return {
    projectKey: __ENV.CTP_PROJECT_KEY,
    clientId: __ENV.CTP_CLIENT_ID,
    clientSecret: __ENV.CTP_CLIENT_SECRET,
    apiUrl:
      __ENV.CTP_API_URL || 'https://api.europe-west1.gcp.commercetools.com',
    authUrl:
      __ENV.CTP_AUTH_URL || 'https://auth.europe-west1.gcp.commercetools.com',
  }
}

export function validateClientConfig() {
  const { projectKey, clientId, clientSecret } = getClientConfig()
  if (!projectKey || !clientId || !clientSecret)
    throw new Error(
      `Client configuration is not provided. Please add the commercetools api client configuration.`
    )
}
