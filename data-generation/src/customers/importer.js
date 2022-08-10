const ProgressLog = require('../progress-log')
const { fetchCustomersConfig } = require('../custom-object')
const { apiRoot } = require('../client')
const logger = require('../logger').getLogger()
const { validateConfig } = require('../validator')
const { buildCustomerDraft } = require('./draft-builder')
const { randomWord } = require('../random')
const schema = require('./schema.json')

const progressLog = new ProgressLog((progress, processed, total) =>
  logger.info(
    `Progress on customer data generation: ${progress}% (${processed}/${total}).`
  )
)

async function generateCustomers(batchSize = 100) {
  const startDate = new Date()

  const config = await fetchCustomersConfig()
  const validationResult = validateConfig(schema, config)
  if (validationResult.skip) return validationResult

  logger.info({ config }, `The customer data generation is started`)
  const stats = {
    created: 0,
  }

  const { amount } = config
  progressLog.setTotal(amount)

  let lastCustomerKey = await fetchLastCustomerKey()
  let batch = []
  for (let counter = 1; counter < amount; counter++) {
    const suffix = `${randomWord()}_${counter}`
    batch.push({ suffix, customerKey: ++lastCustomerKey })
    if (batch.length === batchSize) {
      await executeBatch(batch, stats)
      batch = []
    }
  }
  await executeBatch(batch, stats)
  await createLastCustomer(amount, ++lastCustomerKey, stats)

  logger.info('The customer data generation is completed.')
  const endDate = new Date()
  stats.executionTimeInSeconds = Math.floor(
    Math.abs(endDate - startDate) / 1000
  )

  return stats
}

async function executeBatch(batch, stats) {
  await Promise.all(
    batch.map(async ({ suffix, customerKey }) => {
      await buildDraftAndCreateCustomer(suffix, customerKey)
      stats.created++
      progressLog.increment()
    })
  )
}

const maxRetry = 5
async function buildDraftAndCreateCustomer(
  suffix,
  customerKey,
  retryCounter = 0
) {
  try {
    const customerDraft = buildCustomerDraft(suffix, customerKey)
    await apiRoot().customers().post({ body: customerDraft }).execute()
  } catch (err) {
    logger.error(err)
    if (
      retryCounter < maxRetry &&
      (err.statusCode === 400 ||
        err.statusCode === 409 ||
        err.statusCode >= 500)
    ) {
      await buildDraftAndCreateCustomer(suffix, customerKey, ++retryCounter)
      return
    }

    throw err
  }
}

async function createLastCustomer(amount, customerKey, stats) {
  const suffix = `${randomWord()}_${amount}`
  await buildDraftAndCreateCustomer(suffix, customerKey)
  stats.created++
  progressLog.increment()
}

async function fetchLastCustomerKey() {
  const queryArgs = {
    limit: 1,
    withTotal: false,
    where: 'title="data-generation"',
    sort: 'createdAt desc',
  }
  const {
    body: { results },
    statusCode,
  } = await apiRoot().customers().get({ queryArgs }).execute()

  let lastCustomerKey = 0
  if (statusCode === 200 && results.length > 0) {
    const { key } = results[0]
    lastCustomerKey = parseInt(key.replace('customer_', ''), 10)
  }
  return lastCustomerKey
}

module.exports = {
  generateCustomers,
}
