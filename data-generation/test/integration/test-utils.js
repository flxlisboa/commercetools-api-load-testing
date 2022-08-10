const { apiRoot, fetchWithBatches } = require('../../src/client')
const { getCustomObjectMetadata } = require('../../src/custom-object')
const taxCategoryDraft = require('../resources/tax-category-draft.json')

async function deleteCustomObject() {
  try {
    await apiRoot()
      .customObjects()
      .withContainerAndKey(getCustomObjectMetadata())
      .delete()
      .execute()
  } catch (err) {
    if (err.statusCode === 404) return

    throw err
  }
}

async function createOrUpdateCustomObject(value) {
  await apiRoot()
    .customObjects()
    .post({
      body: {
        ...getCustomObjectMetadata(),
        value,
      },
    })
    .execute()
}

async function getAmountOfAttributesForAllProductTypes() {
  let amountOfAttributes = []
  const uri = apiRoot().productTypes().get().clientRequest().uri
  await fetchWithBatches(uri, (items) => {
    amountOfAttributes = [
      ...amountOfAttributes,
      ...items.map((item) => item.attributes.length),
    ]
  })
  return new Set(amountOfAttributes)
}

async function deleteAllProductTypes() {
  const uri = apiRoot().productTypes().get().clientRequest().uri
  await fetchWithBatches(uri, (items) =>
    Promise.all(
      items.map(async (item) => {
        await apiRoot()
          .productTypes()
          .withId({ ID: item.id })
          .delete({ queryArgs: { version: item.version } })
          .execute()
      })
    )
  )
}

async function deleteAllProducts() {
  const uri = apiRoot().products().get().clientRequest().uri
  await fetchWithBatches(uri, (products) =>
    Promise.all(
      products.map(async (product) => {
        const { body: updatedProduct } = await apiRoot()
          .products()
          .withId({ ID: product.id })
          .post({
            body: {
              actions: [{ action: 'unpublish' }],
              version: product.version,
            },
          })
          .execute()

        await apiRoot()
          .products()
          .withId({ ID: product.id })
          .delete({ queryArgs: { version: updatedProduct.version } })
          .execute()
      })
    )
  )
}

async function ensureTaxCategory() {
  const {
    body: {
      results: [taxCategory],
    },
  } = await apiRoot()
    .taxCategories()
    .get({ queryArgs: { limit: 1 } })
    .execute()

  if (!taxCategory) {
    await apiRoot().taxCategories().post({ body: taxCategoryDraft }).execute()
  }
}

async function deleteAllCustomers() {
  const uri = apiRoot().customers().get().clientRequest().uri
  await fetchWithBatches(uri, (items) =>
    Promise.all(
      items.map(async (item) => {
        await apiRoot()
          .customers()
          .withId({ ID: item.id })
          .delete({ queryArgs: { version: item.version } })
          .execute()
      })
    )
  )
}

async function deleteAllCartDiscounts() {
  const uri = apiRoot().cartDiscounts().get().clientRequest().uri
  await fetchWithBatches(uri, (items) =>
    Promise.all(
      items.map(async (item) => {
        await apiRoot()
          .cartDiscounts()
          .withId({ ID: item.id })
          .delete({ queryArgs: { version: item.version } })
          .execute()
      })
    )
  )
}

async function deleteAllDiscountCodes() {
  const uri = apiRoot().discountCodes().get().clientRequest().uri
  await fetchWithBatches(uri, (items) =>
    Promise.all(
      items.map(async (item) => {
        await apiRoot()
          .discountCodes()
          .withId({ ID: item.id })
          .delete({ queryArgs: { version: item.version } })
          .execute()
      })
    )
  )
}

module.exports = {
  deleteCustomObject,
  createOrUpdateCustomObject,
  deleteAllProductTypes,
  deleteAllProducts,
  getAmountOfAttributesForAllProductTypes,
  ensureTaxCategory,
  deleteAllCustomers,
  deleteAllCartDiscounts,
  deleteAllDiscountCodes,
}
