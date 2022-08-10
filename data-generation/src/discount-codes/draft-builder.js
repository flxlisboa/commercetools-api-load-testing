const { getValidFrom, getValidUntil } = require('../random')

function buildDiscountCodeDraft(
  prefix,
  cartPredicate,
  maxApplicationsPerCustomer,
  cartDiscount,
  discountCode
) {
  const discountCodeDraft = {
    key: prefix,
    code: `${discountCode}`,
    name: { 'de-DE': prefix },
    description: {
      'de-DE': 'data-generation',
    },
    isActive: true,
    validFrom: getValidFrom(),
    validUntil: getValidUntil(),
    cartDiscounts: buildCartDiscountReference(cartDiscount),
  }
  if (cartPredicate) {
    discountCodeDraft.cartPredicate = cartPredicate
  }
  if (maxApplicationsPerCustomer) {
    discountCodeDraft.maxApplicationsPerCustomer = maxApplicationsPerCustomer
  }
  return discountCodeDraft
}

function buildCartDiscountReference({ id }) {
  return [
    {
      typeId: 'cart-discount',
      id,
    },
  ]
}

module.exports = {
  buildDiscountCodeDraft,
}
