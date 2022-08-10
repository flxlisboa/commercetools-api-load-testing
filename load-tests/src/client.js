import http from 'k6/http'
import { check } from 'k6'
import encoding from 'k6/encoding'

import { randomUUID } from './random.js'

export function obtainAccessToken({
  projectKey,
  clientId,
  clientSecret,
  authUrl,
}) {
  // https://docs.commercetools.com/api/authorization#client-credentials-flow
  let url = `${authUrl}/oauth/token`
  const requestBody = {
    grant_type: 'client_credentials',
    scope: `manage_project:${projectKey}`,
  }

  const encodedCredentials = encoding.b64encode(`${clientId}:${clientSecret}`)
  const params = {
    auth: 'basic',
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
    },
  }
  const response = http.post(url, requestBody, params)

  check(response, {
    obtainAccessToken_Check: (r) => r.status === 200,
  })

  return response.json()
}

export function post({
  endpoint,
  action,
  body,
  context: { apiUrl, projectKey, access_token, journey },
}) {
  const data = JSON.stringify(body)
  const params = {
    tags: {
      journey,
      name: action,
    },
    headers: buildHeaders(access_token, journey, action),
  }
  return http.post(`${apiUrl}/${projectKey}/${endpoint}`, data, params)
}

function buildHeaders(access_token, journey, action) {
  return {
    Authorization: `Bearer ${access_token}`,
    'Content-Type': 'application/json',
    'X-Correlation-ID': buildCorrelationId(journey, action),
  }
}

function buildCorrelationId(journey, action) {
  // see: https://k6.io/docs/using-k6/execution-context-variables/#__vu-and-__iter
  return `k6-load-test/${journey}/vu-${__VU}/${action}/${randomUUID()}`
}

export function get({
  endpoint,
  action,
  context: { apiUrl, projectKey, access_token, journey },
}) {
  const params = {
    tags: {
      journey,
      name: action,
    },
    headers: buildHeaders(access_token, journey, action),
  }
  return http.get(`${apiUrl}/${projectKey}/${endpoint}`, params)
}

export function graphqlQuery({ action, query, variables, context }) {
  let body = {
    query,
  }
  if (variables) {
    body.variables = variables
  }
  return post({
    endpoint: 'graphql',
    action,
    body,
    context,
  })
}
