const { apiRoot } = require('../src/client')

function getCustomObjectMetadata() {
  return {
    container: 'load-test',
    key: 'data-generation',
  }
}

function fetchCustomObject() {
  return apiRoot()
    .customObjects()
    .withContainerAndKey(getCustomObjectMetadata())
    .get()
    .execute()
}

async function fetchProductTypesConfig() {
  return fetchConfig('productTypes')
}

async function fetchProductsConfig() {
  return fetchConfig('products')
}

async function fetchCustomersConfig() {
  return fetchConfig('customers')
}

async function fetchCartDiscountsConfig() {
  return fetchConfig('cartDiscounts')
}

async function fetchDiscountCodesConfig() {
  return fetchConfig('discountCodes')
}

async function fetchConfig(resource) {
  const {
    body: { value },
  } = await fetchCustomObject()
  return value[resource]
}

module.exports = {
  getCustomObjectMetadata,
  fetchProductTypesConfig,
  fetchCustomersConfig,
  fetchProductsConfig,
  fetchCartDiscountsConfig,
  fetchDiscountCodesConfig,
}
