const ProgressLog = require('../progress-log')
const { fetchCartDiscountsConfig } = require('../custom-object')
const { apiRoot } = require('../client')
const logger = require('../logger').getLogger()
const { validateConfig } = require('../validator')
const { buildCartDiscountDraft } = require('./draft-builder')
const { randomWord } = require('../random')
const schema = require('./schema.json')

const progressLog = new ProgressLog((progress, processed, total) =>
  logger.info(
    `Progress on cart discount data generation: ${progress}% (${processed}/${total}).`
  )
)

async function generateCartDiscounts(batchSize = 100) {
  const startDate = new Date()

  const config = await fetchCartDiscountsConfig()
  const validationResult = validateConfig(schema, config)
  if (validationResult.skip) return validationResult

  logger.info({ config }, `The cart discount data generation is started`)
  const stats = {
    created: 0,
  }

  progressLog.setTotal(getTotalAmount(config))

  await generateCartDiscountsThatAppliesToAllCarts(config, stats, batchSize)
  await generateCartDiscountsThatRequiresDiscountCode(config, stats, batchSize)

  logger.info('The cart discount data generation is completed.')
  const endDate = new Date()
  stats.executionTimeInSeconds = Math.floor(
    Math.abs(endDate - startDate) / 1000
  )

  return stats
}

function getTotalAmount(config) {
  return (
    (config?.requiresDiscountCode?.amount || 0) +
    (config?.appliesToAllCarts?.amount || 0)
  )
}

async function generateCartDiscountsThatAppliesToAllCarts(
  { appliesToAllCarts },
  stats,
  batchSize
) {
  if (!appliesToAllCarts) return

  const { amount, cartDiscountDrafts } = appliesToAllCarts

  let batch = []
  for (let counter = 1; counter <= amount; counter++) {
    const prefix = `${randomWord()}_all_${counter}`
    const cartDiscountValues =
      cartDiscountDrafts[counter % cartDiscountDrafts.length]

    batch.push({ prefix, cartDiscountValues })
    if (batch.length === batchSize) {
      await executeBatch(batch, stats)
      batch = []
    }
  }
  await executeBatch(batch, stats)
}

async function generateCartDiscountsThatRequiresDiscountCode(
  { requiresDiscountCode },
  stats,
  batchSize
) {
  if (!requiresDiscountCode) return

  const { amount, cartDiscountDrafts } = requiresDiscountCode
  let batch = []
  for (let counter = 1; counter <= amount; counter++) {
    const prefix = `${randomWord()}_requiresDiscountCode_${counter}`
    const cartDiscountValues =
      cartDiscountDrafts[counter % cartDiscountDrafts.length]
    cartDiscountValues.requiresDiscountCode = true

    batch.push({ prefix, cartDiscountValues })
    if (batch.length === batchSize) {
      await executeBatch(batch, stats)
      batch = []
    }
  }
  await executeBatch(batch, stats)
}

async function executeBatch(batch, stats) {
  await Promise.all(
    batch.map(async ({ prefix, cartDiscountValues }) => {
      await buildDraftAndCreateCartDiscount(prefix, cartDiscountValues)
      stats.created++
      progressLog.increment()
    })
  )
}

const maxRetry = 5
async function buildDraftAndCreateCartDiscount(
  prefix,
  cartDiscountValues,
  retryCounter = 0
) {
  try {
    const cartDiscountDraft = buildCartDiscountDraft(prefix, cartDiscountValues)
    await apiRoot().cartDiscounts().post({ body: cartDiscountDraft }).execute()
  } catch (err) {
    logger.error(err)
    if (
      retryCounter < maxRetry &&
      (err.statusCode === 400 ||
        err.statusCode === 409 ||
        err.statusCode >= 500)
    ) {
      await buildDraftAndCreateCartDiscount(
        prefix,
        cartDiscountValues,
        ++retryCounter
      )
      return
    }

    throw err
  }
}

module.exports = {
  generateCartDiscounts,
}
