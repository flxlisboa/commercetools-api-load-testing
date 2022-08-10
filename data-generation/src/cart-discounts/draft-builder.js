const { randomNumber, getValidUntil, getValidFrom } = require('../random')

function buildCartDiscountDraft(
  prefix,
  {
    value,
    cartPredicate = '1 = 1',
    target,
    isActive = true,
    requiresDiscountCode = false,
  }
) {
  return {
    name: { 'de-DE': prefix },
    key: prefix,
    description: {
      'de-DE': 'data-generation',
    },
    value,
    cartPredicate,
    target,
    sortOrder: randomSortOrder(),
    isActive,
    requiresDiscountCode,
    validFrom: getValidFrom(),
    validUntil: getValidUntil(),
  }
}

function randomSortOrder() {
  // example: 0.6024451578, 0.761853565669555
  return `0.${randomNumber(0, 100000)}${randomNumber(1, 100000)}${randomNumber(
    1,
    100000
  )}${randomNumber(1, 9)}`
}

module.exports = {
  buildCartDiscountDraft,
}
