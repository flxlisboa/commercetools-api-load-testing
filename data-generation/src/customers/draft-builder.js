const { randomEmail } = require('../random')

function buildCustomerDraft(suffix, customerKey) {
  return {
    email: randomEmail(suffix),
    password: '123456',
    key: `customer_${customerKey}`,
    title: 'data-generation',
  }
}

module.exports = {
  buildCustomerDraft,
}
