import { getClientConfig, validateClientConfig } from './config.js'
import { get, obtainAccessToken } from './client.js'
import { check, fail } from 'k6'

export function buildContext(scenarioName) {
  validateClientConfig()

  const startedAt = new Date().toISOString().split('.')[0].replace(/[:]/g, '-')
  const {
    projectKey,
    clientId,
    clientSecret,
    apiUrl,
    authUrl,
  } = getClientConfig()
  const { access_token } = obtainAccessToken({
    projectKey,
    clientId,
    clientSecret,
    authUrl,
  })

  return {
    projectKey,
    apiUrl,
    authUrl,
    access_token,
    journey: `${scenarioName}/${startedAt}`,
  }
}

export function getTotalCustomer(context) {
  const where = `&where=title%3D%22data-generation%22`
  const sort = `&sort=createdAt%20desc`
  const queryParams = `?limit=1&withTotal=false${where}${sort}`

  let response = get({
    endpoint: `customers${queryParams}`,
    action: 'fetchLastCustomerKey',
    context,
  })

  if (
    check(response, { fetchLastCustomerKey_Check: (r) => r.status === 200 })
  ) {
    response = response.json()
  } else {
    logger.error(response)
    fail(response.json().message)
  }

  let totalCustomer = 0
  if (response.results.length > 0) {
    const { key } = response.results[0]
    totalCustomer = parseInt(key.replace('customer_', ''), 10)
  }

  if (totalCustomer === 0) {
    logger.error(response, 'Project does not have generated customers')
    fail('Project does not have generated customers')
  }

  return totalCustomer
}

export function getTotalSku(context) {
  const where = `&where=description(de-DE%3D%22data-generation%22)`
  const sort = `&sort=createdAt%20desc`
  const queryParams = `?staged=true&limit=1&withTotal=false${where}${sort}`

  let response = get({
    endpoint: `product-projections${queryParams}`,
    action: 'fetchLastProductSku',
    context,
  })

  if (check(response, { fetchLastProductSku_Check: (r) => r.status === 200 })) {
    response = response.json()
  } else {
    logger.error(response)
    fail(response.json().message)
  }

  let totalSku = 0
  if (response.results.length > 0) {
    const { masterVariant, variants } = response.results[0]
    if (variants.length > 0) {
      totalSku = parseInt(variants[variants.length - 1].sku)
    } else {
      totalSku = parseInt(masterVariant.sku)
    }
  }

  if (totalSku === 0) {
    logger.error(response, 'Project does not have generated products')
    fail('Project does not have generated products')
  }

  return totalSku
}

export function getTotalDiscountCode(context) {
  const where = `&where=description(de-DE%3D%22data-generation%22)`
  const sort = `&sort=createdAt%20desc`
  const queryParams = `?limit=1&withTotal=false${where}${sort}`

  let response = get({
    endpoint: `discount-codes${queryParams}`,
    action: 'fetchLastDiscountCode',
    context,
  })

  if (
    check(response, { fetchLastDiscountCode_Check: (r) => r.status === 200 })
  ) {
    response = response.json()
  } else {
    logger.error(response)
    fail(response.json().message)
  }

  let totalDiscountCode = 0
  if (response.results.length > 0) {
    const { code } = response.results[0]
    totalDiscountCode = parseInt(code, 10)
  }

  if (totalDiscountCode === 0) {
    logger.error(response, 'Project does not have generated discount codes')
    fail('Project does not have generated discount codes')
  }

  return totalDiscountCode
}
