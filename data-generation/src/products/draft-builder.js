const cloneDeep = require('lodash.clonedeep')
const {
  randomWord,
  randomNumber,
  randomBoolean,
  randomCountryCode,
  randomDate,
  randomMoneyAmount,
  randomLocalizedSlug,
  randomCurrencyCode,
} = require('../random')

function buildProductDraft(
  prefix,
  { variants: variantsConfig = {} },
  productType,
  taxCategory,
  skus
) {
  const variants = buildVariants(prefix, variantsConfig, productType, skus)
  const masterVariant = variants.shift()
  return {
    name: { ['de-DE']: `${prefix}_${randomWord()}` },
    key: `${prefix}_${randomWord()}`,
    slug: randomLocalizedSlug(),
    description: { 'de-DE': 'data-generation' },
    productType: {
      typeId: 'product-type',
      id: productType.id,
    },
    masterVariant,
    variants,
    taxCategory: {
      type: 'taxCategory',
      id: taxCategory.id,
    },
    publish: true,
  }
}

function buildVariants(prefix, { prices = {} }, productType, skus) {
  return skus.map((sku) => ({
    sku: `${sku}`,
    prices: prices.commonPrices?.concat(buildPrices(prices.randomizedPrices)),
    attributes: buildAttributes(productType),
  }))
}

function buildPrices({
  min = 0,
  max = 0,
  mustHaveCountries = [],
  currencies = [],
  minCentAmount = 0,
  maxCentAmount = 1000,
}) {
  const totalOfCountryCodes = 3
  const prices = []
  const numberOfPrices = randomNumber(min, Math.min(max, totalOfCountryCodes))
  const centAmount = randomNumber(minCentAmount, maxCentAmount + 1)
  const countryCodes = generateUniqueCountryCodes(
    numberOfPrices,
    mustHaveCountries
  )
  for (let i = 0; i < numberOfPrices; i++) {
    const price = {
      value: {
        type: 'centPrecision',
        currencyCode: getPriceCurrency(currencies),
        centAmount,
        fractionDigits: 2,
      },
      country: Array.from(countryCodes.values())[i],
    }
    prices.push(price)
  }
  return prices
}

function generateUniqueCountryCodes(amount, mustHaveCountries) {
  const countryCodes = new Set()
  mustHaveCountries.forEach((countryCode) => {
    countryCodes.add(countryCode)
  })
  while (countryCodes.size < amount) {
    const countryCode = randomCountryCode()
    if (!countryCodes.has(countryCode)) {
      countryCodes.add(countryCode)
    }
  }
  return countryCodes
}

function getPriceCurrency(currencies = []) {
  if (currencies.length > 0) {
    const position = randomNumber(0, currencies.length)
    return currencies[position]
  }
  return randomCurrencyCode()
}

function buildAttributes(productType) {
  const attributes = []
  const attributesDefinitions = cloneDeep(productType.attributes)
  attributesDefinitions.forEach((attributeDefinition) => {
    const attributeType = attributeDefinition.type
    const attributeValue = buildAttributeValue(attributeType)
    attributes.push({ name: attributeDefinition.name, value: attributeValue })
  })
  return attributes
}

function buildAttributeValue(attributeType) {
  const attributeTypeName = attributeType.name
  switch (attributeTypeName) {
    case 'boolean':
      return buildBooleanValue()
    case 'text':
      return buildTextValue()
    case 'ltext':
      return buildLtextValue()
    case 'enum':
      return buildEnumValue(attributeType)
    case 'lenum':
      return buildLenumValue(attributeType)
    case 'number':
      return buildNumberValue()
    case 'money':
      return buildMoneyValue()
    case 'date':
      return buildDateValue()
    case 'time':
      return buildTimeValue()
    case 'datetime':
      return buildDatetimeValue()
    case 'set':
      return buildSetValue(attributeType)
    default:
      throw new Error(
        `Unknown product attribute type ${JSON.stringify(attributeType)}`
      )
  }
}

function buildBooleanValue() {
  return randomBoolean()
}

function buildTextValue() {
  return randomWord()
}

function buildLtextValue() {
  return {
    [randomCountryCode()]: randomWord(),
  }
}

function buildEnumValue(attributeType) {
  const position = randomNumber(0, attributeType.values.length)
  return attributeType.values[position]
}

function buildLenumValue(attributeType) {
  return buildEnumValue(attributeType).key
}

function buildNumberValue() {
  return randomNumber(0, 1000)
}

function buildMoneyValue() {
  return randomMoneyAmount()
}

function buildDateValue() {
  return randomDate().toISOString().split('T')[0]
}

function buildTimeValue() {
  return randomDate().toISOString().split('T')[1].split('.')[0]
}

function buildDatetimeValue() {
  return randomDate()
}

function buildSetValue(attributeType) {
  const numberOfElements = randomNumber(1, 10)
  const setElements = []
  for (let i = 0; i < numberOfElements; i++) {
    setElements.push(buildAttributeValue(attributeType.elementType))
  }
  return [...new Set(setElements)]
}

module.exports = {
  buildProductDraft,
}
