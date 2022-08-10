import { get } from '../client.js'
import { check } from 'k6'

export function getProductProjectionBySku(sku, trend, errorCallback, context) {
  const queryParams = `?staged=true&where=masterVariant(sku%3D%22${sku}%22)%20or%20variants(sku%3D%22${sku}%22)`
  const response = get({
    endpoint: `product-projections${queryParams}`,
    action: 'getProductProjectionBySku',
    context,
  })

  trend.add(response.timings.duration)
  if (
    check(response, {
      getProductProjectionBySku_Check: (r) => r.status === 200,
    })
  ) {
    return response.json().results.length > 0
  }

  errorCallback(response)
}

export function getCategories(trend, errorCallback, context) {
  const response = get({
    endpoint: `categories`,
    action: 'getCategories',
    context,
  })

  trend.add(response.timings.duration)
  if (check(response, { getCategories_Check: (r) => r.status === 200 })) {
    return response.json()
  }

  errorCallback(response)
}

export function searchProductsByStore(storeKey, trend, errorCallback, context) {
  const queryParams = `?staged=true&markMatchingVariants=false&storeProjection%3D${storeKey}`
  const response = get({
    endpoint: `product-projections/search${queryParams}`,
    action: 'searchProducts',
    context,
  })

  trend.add(response.timings.duration)
  if (
    !check(response, {
      searchProducts_Check: (r) => r.status === 200,
    })
  ) {
    errorCallback(response)
  }
}

export function searchProductsBySku(sku, trend, errorCallback, context) {
  const queryParams = `?staged=true&markMatchingVariants=false&&filter=variants.sku%3A${sku}`
  const response = get({
    endpoint: `product-projections/search${queryParams}`,
    action: 'getProductBySku',
    context,
  })

  trend.add(response.timings.duration)
  if (
    check(response, {
      getProductBySku_Check: (r) => r.status === 200,
    })
  ) {
    return response.json().results.length > 0
  }
  errorCallback(response)
}
