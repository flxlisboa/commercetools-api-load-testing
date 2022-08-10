// eslint-disable-next-line import/no-extraneous-dependencies
const nock = require('nock')
const { getClientConfig } = require('../../src/config')
const { getCustomObjectMetadata } = require('../../src/custom-object')

const { projectKey, authUrl, apiUrl } = getClientConfig()
const { container, key } = getCustomObjectMetadata()

class CommercetoolsMock {
  constructor() {
    this.authScope = nock(`${authUrl}`)
    this.apiScope = nock(`${apiUrl}`)
    this.auth()
  }

  auth() {
    this.authScope.post('/oauth/token').reply(200, {
      access_token: 'xxx',
      token_type: 'Bearer',
      expires_in: 172800,
      scope: 'manage_project:xxx',
    })
  }

  getCustomObject(value) {
    this.apiScope
      .get(`/${projectKey}/custom-objects/${container}/${key}`)
      .query(true)
      .reply(200, { value })
  }

  queryResource(endpoint, results) {
    this.apiScope
      .get(`/${projectKey}/${endpoint}`)
      .query(true)
      .reply(200, { results })
  }

  createResource(endpoint, callback) {
    this.apiScope
      .persist()
      .post(`/${projectKey}/${endpoint}`)
      .reply(201, (uri, requestBody) => {
        if (callback) {
          callback(requestBody, uri)
        }
      })
  }

  returnBadRequest(endpoint) {
    const http400Error = {
      statusCode: 400,
      message: 'Request body does not contain valid JSON.',
      errors: [
        {
          code: 'InvalidJsonInput',
          message: 'Request body does not contain valid JSON.',
          detailedErrorMessage: 'key: Missing required value',
        },
      ],
    }
    this.apiScope
      .persist()
      .post(`/${projectKey}/${endpoint}`)
      .reply(400, http400Error)
  }

  clear() {
    nock.cleanAll()
  }
}

module.exports = CommercetoolsMock
