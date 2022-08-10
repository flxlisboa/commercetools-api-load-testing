import { buildContext, getTotalSku } from '../context.js'
import { buildLogger } from '../logger.js'
import { fail, group, sleep } from 'k6'
import { randomElement, randomNumber, randomUUID } from '../random.js'
import {
  searchProductsByStore,
  searchProductsBySku,
} from '../helpers/browseShop.js'
import { Trend } from 'k6/metrics'
import {
  addLineItemToCart,
  createCart,
  createOrderFromCart,
  getCartById,
  setShippingAddress,
} from '../helpers/checkout.js'

const scenarioName = 'Example-checkout'
const logger = buildLogger(scenarioName)

function sleepRandomly() {
  sleep(randomNumber(5, 10))
}

const setShippingAddressTrend = new Trend('duration_setShippingAddress', true)
const getCartBydIdTrend = new Trend('duration_getCartById', true)
const createCartTrend = new Trend('duration_createCart', true)
const searchProductBySkuTrend = new Trend('duration_searchProductBySku', true)
const addLineItemTrend = new Trend('duration_addLineItem', true)
const createOrderTrend = new Trend('duration_createOrder', true)
const searchProductsTrend = new Trend('duration_searchProducts', true)

const countries = ['CH', 'DE', 'FR', 'NL', 'AT', 'BE', 'DK', 'IT', 'ES', 'PL']

export default function (context) {
  let cartId

  // prepare cart draft
  const country = randomElement(countries)
  const storeKey = `store-${country}`
  const distributionChannelKey = `channel-${country}`
  const cartDraft = {
    currency: 'EUR',
    country,
    store: {
      key: storeKey,
    }
  }
  const totalLineItemInCart = __VU % 400 === 0 ? 500 : randomNumber(2, 5)
  if (__VU % 400 === 0) {
    logger.info('large cart creation ' + __VU)
  }

  group('browse shop and add line items', function () {
    searchProductsByStore(storeKey, searchProductsTrend, errorCallback, context)
    const skus = pickRandomSkus(context, totalLineItemInCart + 2)
    const skusToAdd = []
    for (let i = 0; i < skus.length; i++) {
      const sku = skus[i]
      if (i > 10) {
        skusToAdd.push(sku)
        continue
      }
      const skuExists = searchProductsBySku(
        sku,
        searchProductBySkuTrend,
        errorCallback,
        context
      )
      if (skuExists) {
        skusToAdd.push(sku)
      }
      sleepRandomly()
    }

    cartId = createAnonymousCart(context, cartDraft)
    sleepRandomly()

    let i = 0
    while (i < totalLineItemInCart) {
      if (i < 10) {
        const sku = skusToAdd[i]
        const cart = getCartById(
          cartId,
          getCartBydIdTrend,
          errorCallback,
          context
        )
        const actions = [
          {
            action: 'addLineItem',
            sku: sku,
            quantity: randomNumber(1, 3),
            distributionChannel: { key: distributionChannelKey },
          },
        ]
        addLineItemToCart(
          cart,
          actions,
          addLineItemTrend,
          errorCallback,
          context
        )
        i++
        sleepRandomly()
      } else {
        const actions = []
        const cart = getCartById(
          cartId,
          getCartBydIdTrend,
          errorCallback,
          context
        )

        for (let j = i; j < i + 25 && j < totalLineItemInCart; j++) {
          actions.push({
            action: 'addLineItem',
            sku: skusToAdd[j],
            quantity: 1,
            distributionChannel: { key: distributionChannelKey },
          })
        }

        addLineItemToCart(
          cart,
          actions,
          addLineItemTrend,
          errorCallback,
          context
        )
        i += 25
        sleepRandomly()
      }
    }
  })

  group('create order from the cart', function () {
    let cart = getCartById(cartId, getCartBydIdTrend, errorCallback, context)
    setShippingAddress(
      cart,
      country,
      setShippingAddressTrend,
      errorCallback,
      context
    )
    sleepRandomly()

    cart = getCartById(cartId, getCartBydIdTrend, errorCallback, context)
    createOrderFromCart(cart, createOrderTrend, errorCallback, context)
    sleepRandomly()
  })
}

function createAnonymousCart(context, cartDraft) {
  cartDraft.anonymousId = randomUUID()
  return createCart(cartDraft, createCartTrend, errorCallback, context)
}

function pickRandomSkus({ totalSku }, totalLineItemInCart) {
  const skus = []
  for (let i = 0; i <= totalLineItemInCart; i++) {
    if (__VU % 400 === 0)
      skus.push(`${randomNumber(700000, 750000)}`)
    else skus.push(`${randomNumber(1, totalSku + 1)}`)
  }
  return skus
}

function errorCallback(response) {
  logger.error(response)
  fail(response.json().message)
}

export function setup() {
  logger.info(`The ${scenarioName} is started`)
  const context = buildContext(scenarioName)
  context.totalSku = getTotalSku(context)
  logger.info(context)
  logger.info(`X-Correlation-ID header prefix: k6-load-test/${context.journey}`)
  return context
}

export function teardown(context) {
  logger.info(`The ${scenarioName} is completed`)
  logger.info(`X-Correlation-ID header prefix: k6-load-test/${context.journey}`)
}
