const faker = require('faker')

function randomWord() {
  return faker.lorem.words(2).replace(' ', '_')
}

function randomNumber(minInclusive, maxExclusive) {
  return Math.floor(
    Math.random() * (maxExclusive - minInclusive) + minInclusive
  )
}

function randomBoolean() {
  return faker.datatype.boolean()
}

function randomCountryCode() {
  return faker.address.countryCode('alpha-2').toUpperCase()
}

function randomCurrencyCode() {
  return faker.finance.currencyCode()
}

function randomMoneyAmount() {
  return {
    currencyCode: randomCurrencyCode(),
    centAmount: Math.round(faker.finance.amount() * 100),
  }
}

function randomDate() {
  return faker.datatype.datetime()
}

function randomLocalizedSlug() {
  return {
    ['de-DE']: `${randomWord()}_${randomNumber(0, 10000)}_${randomWord()}`,
  }
}

function randomEmail(suffix) {
  return faker.internet.email().replace('@', `_${suffix}@`).toLowerCase()
}

function getValidFrom() {
  return new Date().toISOString()
}

function getValidUntil() {
  const now = new Date()
  now.setFullYear(now.getFullYear() + 1)
  return now.toISOString()
}

module.exports = {
  randomWord,
  randomNumber,
  randomBoolean,
  randomCountryCode,
  randomMoneyAmount,
  randomDate,
  randomLocalizedSlug,
  randomCurrencyCode,
  randomEmail,
  getValidUntil,
  getValidFrom,
}
