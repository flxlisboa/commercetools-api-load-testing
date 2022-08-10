const logger = require('./logger').getLogger()
const { generateProductTypes } = require('./product-types/importer')
const { generateProducts } = require('./products/importer')
const { generateCustomers } = require('./customers/importer')
const { generateCartDiscounts } = require('./cart-discounts/importer')
const { generateDiscountCodes } = require('./discount-codes/importer')
const packageJson = require('../package.json')

// eslint-disable-next-line import/newline-after-import
;(async function main() {
  logger.info(`${packageJson.name} started`)
  try {
    const productTypeStats = await generateProductTypes()
    logger.info(productTypeStats)
    const productStats = await generateProducts()
    logger.info(productStats)
    const customerStats = await generateCustomers()
    logger.info(customerStats)
    const cartDiscountStats = await generateCartDiscounts()
    logger.info(cartDiscountStats)
    const discountCodeStats = await generateDiscountCodes()
    logger.info(discountCodeStats)

    logger.info(`${packageJson.name} finished`)
  } catch (err) {
    logger.error(err, `${packageJson.name} failed`)
    process.exitCode = 1
  }
})()
