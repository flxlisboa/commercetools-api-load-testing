import { get, post } from '../client.js'
import { check, sleep } from 'k6'
import { randomAddress } from '../random.js'

export function createCart(cartDraft, trend, errorCallback, context) {
  const createCartResponse = post({
    endpoint: 'carts',
    action: 'createCart',
    body: cartDraft,
    context,
  })

  trend.add(createCartResponse.timings.duration)

  if (
    check(createCartResponse, { createCart_Check: (r) => r.status === 201 })
  ) {
    return createCartResponse.json().id
  }

  errorCallback(createCartResponse)
}

export function getCartById(cartId, trend, errorCallback, context) {
  const response = get({
    endpoint: `carts/${cartId}`,
    action: 'getCartById',
    context,
  })

  trend.add(response.timings.duration)
  if (check(response, { getCartById_Check: (r) => r.status === 200 })) {
    sleep(1)
    return response.json()
  }
  errorCallback(response)
}

export function addLineItemToCart(
  { id, version },
  actions = [],
  trend,
  errorCallback,
  context
) {
  const response = post({
    endpoint: `carts/${id}`,
    action: 'addLineItem',
    body: {
      version,
      actions,
    },
    context,
  })

  trend.add(response.timings.duration)
  if (!check(response, { addLineItem_Check: (r) => r.status === 200 })) {
    errorCallback(response)
  }
}

export function recalculateCart(
  { id, version },
  trend,
  errorCallback,
  context
) {
  const response = post({
    endpoint: `carts/${id}`,
    action: 'recalculateCart',
    body: {
      version,
      actions: [
        {
          action: 'recalculate',
          updateProductData: true,
        },
      ],
    },
    context,
  })
  trend.add(response.timings.duration)
  if (!check(response, { recalculateCart_Check: (r) => r.status === 200 })) {
    errorCallback(response)
  }
}

export function getShippingMethods(cartId, trend, errorCallback, context) {
  const response = get({
    endpoint: `shipping-methods/matching-location?country=${cartDraftTemplate.country}`,
    action: 'getShippingMethods',
    context,
  })

  trend.add(response.timings.duration)
  if (check(response, { getShippingMethods_Check: (r) => r.status === 200 })) {
    return response.json()
  }

  errorCallback(response)
}

export function setShippingAddress(
  { id, version },
  country,
  trend,
  errorCallback,
  context
) {
  const response = post({
    endpoint: `carts/${id}`,
    action: 'setShippingAddress',
    body: {
      version,
      actions: [
        {
          action: 'setShippingAddress',
          address: randomAddress(country),
        },
      ],
    },
    context,
  })

  trend.add(response.timings.duration)
  if (!check(response, { setShippingAddress_Check: (r) => r.status === 200 })) {
    errorCallback(response)
  }
}

export function setBillingAddress(
  { id, version },
  trend,
  errorCallback,
  context
) {
  const response = post({
    endpoint: `carts/${id}`,
    action: 'setBillingAddress',
    body: {
      version,
      actions: [
        {
          action: 'setBillingAddress',
          address: randomAddress(),
        },
      ],
    },
    context,
  })

  trend.add(response.timings.duration)
  if (!check(response, { setBillingAddress_Check: (r) => r.status === 200 })) {
    errorCallback(response)
  }
}

export function createPayment(
  { totalPrice: { currencyCode, centAmount } },
  trend,
  errorCallback,
  context
) {
  const paymentDraft = {
    amountPlanned: {
      currencyCode,
      centAmount,
      fractionDigits: 2,
    },
    paymentMethodInfo: {
      paymentInterface: 'integration',
      method: 'scheme',
      name: {
        en: 'Credit Card',
      },
    },
    transactions: [
      {
        type: 'Authorization',
        amount: {
          currencyCode,
          centAmount,
        },
        state: 'Success',
      },
    ],
  }
  const response = post({
    endpoint: `payments`,
    action: 'createPayment',
    body: paymentDraft,
    context,
  })

  trend.add(response.timings.duration)

  if (check(response, { createPayment_Check: (r) => r.status === 201 })) {
    return response.json()
  } else {
    errorCallback(response)
  }
}

export function addPayment(
  { id, version },
  paymentId,
  trend,
  errorCallback,
  context
) {
  const response = post({
    endpoint: `carts/${id}`,
    action: 'addPayment',
    body: {
      version,
      actions: [
        {
          action: 'addPayment',
          payment: {
            id: paymentId,
            typeId: 'payment',
          },
        },
      ],
    },
    context,
  })

  trend.add(response.timings.duration)
  if (!check(response, { addPayment_Check: (r) => r.status === 200 })) {
    errorCallback(response)
  }
}

export function createOrderFromCart(
  { id, version },
  trend,
  errorCallback,
  context
) {
  const orderFromCartDraft = {
    cart: {
      id,
    },
    version,
  }

  const response = post({
    endpoint: 'orders',
    action: 'createOrderFromCart',
    body: orderFromCartDraft,
    context,
  })

  trend.add(response.timings.duration)

  if (
    !check(response, { createOrderFromCart_Check: (r) => r.status === 201 })
  ) {
    errorCallback(response)
  }
}
