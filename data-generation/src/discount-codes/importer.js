const ProgressLog = require('../progress-log')
const { fetchDiscountCodesConfig } = require('../custom-object')
const { apiRoot } = require('../client')
const logger = require('../logger').getLogger()
const { validateConfig } = require('../validator')
const { buildDiscountCodeDraft } = require('./draft-builder')
const { randomWord } = require('../random')
const schema = require('./schema.json')

const progressLog = new ProgressLog((progress, processed, total) =>
  logger.info(
    `Progress on discount code data generation: ${progress}% (${processed}/${total}).`
  )
)

async function generateDiscountCodes(
  batchSize = 100,
  cartDiscountPageLimit = 200
) {
  const startDate = new Date()

  const config = await fetchDiscountCodesConfig()
  const validationResult = validateConfig(schema, config)
  if (validationResult.skip) return validationResult

  logger.info({ config }, `The discount code data generation is started`)
  const stats = {
    created: 0,
  }
  let cartDiscounts = await fetchCartDiscounts(cartDiscountPageLimit)
  if (cartDiscounts.length === 0) {
    throw new Error('Please create at least 1 cart discount in the project!')
  }

  const {
    randomizedDiscountCodes: { amount },
  } = config
  progressLog.setTotal(amount)

  let lastDiscountCode = await fetchLastDiscountCode()
  let totalFetchedCartDiscounts = cartDiscounts.length
  let hasCartDiscountsToFetch =
    totalFetchedCartDiscounts === cartDiscountPageLimit

  let batch = []
  for (let counter = 1; counter < amount; counter++) {
    const prefix = `${randomWord()}_${counter}`

    const cartDiscount = cartDiscounts[(counter - 1) % cartDiscounts.length]
    // re-fetch when all cartDiscounts are used.
    if (hasCartDiscountsToFetch && counter === totalFetchedCartDiscounts) {
      const fetchedCartDiscounts = await fetchCartDiscounts(
        cartDiscountPageLimit,
        cartDiscount.id
      )
      totalFetchedCartDiscounts += fetchedCartDiscounts.length

      if (fetchedCartDiscounts.length === 0) {
        hasCartDiscountsToFetch = false
      } else if (fetchedCartDiscounts.length !== cartDiscountPageLimit) {
        cartDiscounts = fillFromPreviousItems(
          fetchedCartDiscounts,
          cartDiscounts,
          cartDiscountPageLimit
        )
        hasCartDiscountsToFetch = false
      } else {
        cartDiscounts = fetchedCartDiscounts
      }
    }

    batch.push({ prefix, cartDiscount, discountCode: ++lastDiscountCode })
    if (batch.length === batchSize) {
      await executeBatch(batch, stats, config)
      batch = []
    }
  }
  await executeBatch(batch, stats, config)
  await createLastDiscountCode(config, cartDiscounts, ++lastDiscountCode, stats)

  logger.info('The discount code data generation is completed.')
  const endDate = new Date()
  stats.executionTimeInSeconds = Math.floor(
    Math.abs(endDate - startDate) / 1000
  )

  return stats
}

function fillFromPreviousItems(
  fetchedCartDiscounts,
  cartDiscounts,
  cartDiscountPageLimit
) {
  /*
  The method is used for better distribution of the latest items.
  For instance, when the project have 510 items (with cartDiscountPageLimit=500),
  the code will keep the 490 items from the previous items instead of storing the last 10 item and distributing those.
  */
  return [...fetchedCartDiscounts, ...cartDiscounts].splice(
    0,
    cartDiscountPageLimit
  )
}

async function executeBatch(
  batch,
  stats,
  { randomizedDiscountCodes: { cartPredicate, maxApplicationsPerCustomer } }
) {
  await Promise.all(
    batch.map(async ({ prefix, cartDiscount, discountCode }) => {
      await buildDraftAndCreateDiscountCode(
        prefix,
        cartPredicate,
        maxApplicationsPerCustomer,
        cartDiscount,
        discountCode
      )
      stats.created++
      progressLog.increment()
    })
  )
}

async function fetchCartDiscounts(cartDiscountPageLimit, lastId) {
  const queryArgs = {
    limit: cartDiscountPageLimit,
    sort: 'id asc',
    withTotal: false,
    where: 'requiresDiscountCode = true',
  }
  if (lastId) queryArgs.where += ` AND id > "${lastId}"`
  const {
    body: { results },
  } = await apiRoot().cartDiscounts().get({ queryArgs }).execute()
  return results
}

const maxRetry = 5
async function buildDraftAndCreateDiscountCode(
  prefix,
  cartPredicate,
  maxApplicationsPerCustomer,
  cartDiscount,
  discountCode,
  retryCounter = 0
) {
  try {
    const discountCodeDraft = buildDiscountCodeDraft(
      prefix,
      cartPredicate,
      maxApplicationsPerCustomer,
      cartDiscount,
      discountCode
    )
    await apiRoot().discountCodes().post({ body: discountCodeDraft }).execute()
  } catch (err) {
    logger.error(err)
    if (
      retryCounter < maxRetry &&
      (err.statusCode === 400 ||
        err.statusCode === 409 ||
        err.statusCode >= 500)
    ) {
      await buildDraftAndCreateDiscountCode(
        prefix,
        cartPredicate,
        maxApplicationsPerCustomer,
        cartDiscount,
        discountCode,
        ++retryCounter
      )
      return
    }

    throw err
  }
}

async function fetchLastDiscountCode() {
  const queryArgs = {
    limit: 1,
    withTotal: false,
    where: 'description(de-DE="data-generation")',
    sort: 'createdAt desc',
  }
  const {
    body: { results },
    statusCode,
  } = await apiRoot().discountCodes().get({ queryArgs }).execute()

  let lastDiscountCode = 0
  if (statusCode === 200 && results.length > 0) {
    const { code } = results[0]
    lastDiscountCode = parseInt(code, 10)
  }
  return lastDiscountCode
}

async function createLastDiscountCode(
  config,
  cartDiscounts,
  discountCode,
  stats
) {
  const {
    randomizedDiscountCodes: {
      amount,
      cartPredicate,
      maxApplicationsPerCustomer,
    },
  } = config
  const prefix = `${randomWord()}_${amount}`
  const cartDiscount = cartDiscounts[(amount - 1) % cartDiscounts.length]
  await buildDraftAndCreateDiscountCode(
    prefix,
    cartPredicate,
    maxApplicationsPerCustomer,
    cartDiscount,
    discountCode
  )
  stats.created++
  progressLog.increment()
}

module.exports = {
  generateDiscountCodes,
}
