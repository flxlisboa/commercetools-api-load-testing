const ProgressLog = require('../progress-log')
const { fetchProductsConfig } = require('../custom-object')
const { apiRoot, fetchWithBatches } = require('../client')
const logger = require('../logger').getLogger()
const { randomWord, randomNumber } = require('../random')
const { validateConfig } = require('../validator')
const { buildProductDraft } = require('./draft-builder')
const schema = require('./schema.json')

const progressLog = new ProgressLog((progress, processed, total) =>
  logger.info(
    `Progress on products data generation: ${progress}% (${processed}/${total}).`
  )
)

async function generateProducts(batchSize = 100, productTypePageLimit = 200) {
  const startDate = new Date()
  const config = await fetchProductsConfig()
  const validationResult = validateConfig(schema, config)
  if (validationResult.skip) return validationResult

  logger.info({ config }, `The product data generation is started`)
  let productTypes = await fetchProductTypes(productTypePageLimit)
  if (productTypes.length === 0) {
    throw new Error('Please create at least 1 product type in the project!')
  }
  const taxCategories = await fetchTaxCategories()
  if (taxCategories.length === 0) {
    throw new Error('Please create at least 1 tax category in the project!')
  }

  const stats = {
    created: 0,
  }

  const { amount } = config
  progressLog.setTotal(amount)

  let lastSku = await fetchLastSku()
  let totalFetchedProductTypes = productTypes.length
  let hasProductTypesToFetch = totalFetchedProductTypes === productTypePageLimit

  let batch = []
  for (let counter = 1; counter < amount; counter++) {
    const prefix = `${randomWord()}_${counter}`

    const productType = productTypes[(counter - 1) % productTypes.length]
    // re-fetch when all productTypes are used.
    if (hasProductTypesToFetch && counter === totalFetchedProductTypes) {
      const fetchedProductTypes = await fetchProductTypes(
        productTypePageLimit,
        productType.id
      )
      totalFetchedProductTypes += fetchedProductTypes.length

      if (fetchedProductTypes.length === 0) {
        hasProductTypesToFetch = false
      } else if (fetchedProductTypes.length !== productTypePageLimit) {
        productTypes = fillFromPreviousItems(
          fetchedProductTypes,
          productTypes,
          productTypePageLimit
        )
        hasProductTypesToFetch = false
      } else {
        productTypes = fetchedProductTypes
      }
    }

    const taxCategory = taxCategories[(counter - 1) % taxCategories.length]

    const skus = createIncrementalSkus(config, lastSku)
    lastSku = skus[skus.length - 1]

    batch.push({ prefix, productType, taxCategory, skus })

    if (batch.length === batchSize) {
      await executeBatch(batch, stats, config)
      batch = []
    }
  }
  await executeBatch(batch, stats, config)
  await createLastProduct(config, productTypes, taxCategories, lastSku, stats)

  logger.info('The products data generation is completed.')
  const endDate = new Date()
  stats.executionTimeInSeconds = Math.floor(
    Math.abs(endDate - startDate) / 1000
  )

  return stats
}

function fillFromPreviousItems(
  fetchedProductTypes,
  productTypes,
  productTypePageLimit
) {
  /*
  The method is used for better distribution of the latest items.
  For instance when the project have 510 items (with productTypePageLimit=500),
  the code will keep the 490 items from the previous items instead of storing the last 10 item and distributing those.
  */
  return [...fetchedProductTypes, ...productTypes].splice(
    0,
    productTypePageLimit
  )
}

async function executeBatch(batch, stats, config) {
  await Promise.all(
    batch.map(async ({ prefix, productType, taxCategory, skus }) => {
      await buildDraftAndCreateProduct(
        prefix,
        config,
        productType,
        taxCategory,
        skus
      )
      stats.created++
      progressLog.increment()
    })
  )
}

const maxRetry = 5
async function buildDraftAndCreateProduct(
  prefix,
  config,
  productType,
  taxCategory,
  skus,
  retryCounter = 0
) {
  try {
    const productDraft = buildProductDraft(
      prefix,
      config,
      productType,
      taxCategory,
      skus
    )
    await apiRoot().products().post({ body: productDraft }).execute()
  } catch (err) {
    logger.error(err)
    if (
      retryCounter < maxRetry &&
      (err.statusCode === 400 ||
        err.statusCode === 409 ||
        err.statusCode >= 500)
    ) {
      await buildDraftAndCreateProduct(
        prefix,
        config,
        productType,
        taxCategory,
        skus,
        ++retryCounter
      )
      return
    }

    throw err
  }
}

async function fetchProductTypes(productTypePageLimit, lastId) {
  const queryArgs = {
    limit: productTypePageLimit,
    sort: 'id asc',
    withTotal: false,
  }
  if (lastId) queryArgs.where = `id > "${lastId}"`
  const {
    body: { results },
  } = await apiRoot().productTypes().get({ queryArgs }).execute()
  return results
}

async function fetchTaxCategories() {
  const taxCategories = []
  const uri = apiRoot()
    .taxCategories()
    .get({ queryArgs: { limit: 100 } })
    .clientRequest().uri
  await fetchWithBatches(uri, (items) => taxCategories.push(...items))
  return taxCategories
}

async function createLastProduct(
  config,
  productTypes,
  taxCategories,
  lastSku,
  stats
) {
  const { amount } = config
  const prefix = `${randomWord()}_${amount}`
  const productType = productTypes[(amount - 1) % productTypes.length]
  const taxCategory = taxCategories[(amount - 1) % taxCategories.length]
  const skus = createIncrementalSkus(config, lastSku)
  await buildDraftAndCreateProduct(
    prefix,
    config,
    productType,
    taxCategory,
    skus
  )
  stats.created++
  progressLog.increment()
}

async function fetchLastSku() {
  const queryArgs = {
    limit: 1,
    staged: true,
    withTotal: false,
    where: 'description(de-DE="data-generation")',
    sort: 'createdAt desc',
  }
  const {
    body: { results },
    statusCode,
  } = await apiRoot().productProjections().get({ queryArgs }).execute()

  let lastSku = 0
  if (statusCode === 200 && results.length > 0) {
    const { masterVariant, variants } = results[0]
    if (variants.length > 0) {
      lastSku = parseInt(variants[variants.length - 1].sku, 10)
    } else {
      lastSku = parseInt(masterVariant.sku, 10)
    }
  }
  return lastSku
}

function createIncrementalSkus({ variants: { min = 1, max = 1 } }, lastSku) {
  const numberOfVariants = max === 1 ? 1 : randomNumber(min, max + 1)
  const skus = []
  for (let i = 1; i <= numberOfVariants; i++) {
    skus.push(lastSku + i)
  }
  return skus
}

module.exports = {
  generateProducts,
}
