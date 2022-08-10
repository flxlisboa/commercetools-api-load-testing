const ProgressLog = require('../progress-log')
const { fetchProductTypesConfig } = require('../custom-object')
const { apiRoot } = require('../client')
const logger = require('../logger').getLogger()
const { validateConfig } = require('../validator')
const { buildProductTypeDraft } = require('./draft-builder')
const { randomWord } = require('../random')
const schema = require('./schema.json')

const progressLog = new ProgressLog((progress, processed, total) =>
  logger.info(
    `Progress on product type data generation: ${progress}% (${processed}/${total}).`
  )
)

async function generateProductTypes(batchSize = 100) {
  const startDate = new Date()

  const config = await fetchProductTypesConfig()
  const validationResult = validateConfig(schema, config)
  if (validationResult.skip) return validationResult

  logger.info({ config }, `The product type data generation is started`)
  const stats = {
    created: 0,
  }

  const { amount } = config
  progressLog.setTotal(amount)

  let batch = []
  for (let counter = 1; counter <= amount; counter++) {
    const prefix = `${randomWord()}_${counter}`
    batch.push({ prefix })
    if (batch.length === batchSize) {
      await executeBatch(batch, stats, config)
      batch = []
    }
  }
  await executeBatch(batch, stats, config)

  logger.info('The product type data generation is completed.')
  const endDate = new Date()
  stats.executionTimeInSeconds = Math.floor(
    Math.abs(endDate - startDate) / 1000
  )

  return stats
}

async function executeBatch(batch, stats, config) {
  await Promise.all(
    batch.map(async ({ prefix }) => {
      await buildDraftAndCreateProductType(prefix, config)
      stats.created++
      progressLog.increment()
    })
  )
}

const maxRetry = 5
async function buildDraftAndCreateProductType(
  prefix,
  config,
  retryCounter = 0
) {
  try {
    const productTypeDraft = buildProductTypeDraft(prefix, config)
    await apiRoot().productTypes().post({ body: productTypeDraft }).execute()
  } catch (err) {
    logger.error(err)
    if (
      retryCounter < maxRetry &&
      (err.statusCode === 400 ||
        err.statusCode === 409 ||
        err.statusCode >= 500)
    ) {
      await buildDraftAndCreateProductType(prefix, config, ++retryCounter)
      return
    }

    throw err
  }
}

module.exports = {
  generateProductTypes,
}
