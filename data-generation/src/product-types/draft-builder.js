const {
  randomWord,
  randomNumber,
  randomCountryCode,
  randomBoolean,
} = require('../random')

const attributeTypeList = [
  'boolean',
  'text',
  'ltext',
  'enum',
  'lenum',
  'number',
  'money',
  'date',
  'time',
  'datetime',
  'set',
]

function buildProductTypeDraft(
  prefix,
  { commonAttributes, randomizedAttributes }
) {
  const attributes = [
    ...commonAttributes,
    ...buildRandomAttributeDefinitionDrafts(prefix, randomizedAttributes),
  ]
  return {
    name: `${prefix}_${randomWord()}`,
    key: `${prefix}_${randomWord()}`,
    description: 'data-generation',
    attributes,
  }
}

function buildRandomAttributeDefinitionDrafts(
  prefix,
  { min, max, localesAmount, mustHaveLocales = [], attributeTypes = [] }
) {
  const attributeDefinitions = Object.keys(
    attributeTypes
  ).flatMap((attributeType) =>
    buildRandomAttributeDefinitionDraft(
      prefix,
      attributeType,
      localesAmount,
      mustHaveLocales,
      attributeTypes[attributeType]
    )
  )
  return [
    ...attributeDefinitions,
    ...addMoreAttributeDefinitionsRandomly(
      prefix,
      min,
      max,
      localesAmount,
      mustHaveLocales,
      attributeTypes,
      attributeDefinitions.length
    ),
  ]
}

function buildRandomAttributeDefinitionDraft(
  prefix,
  attributeType,
  labelLocalesAmount,
  mustHaveLocales,
  { amount, enumsAmount, localesAmount }
) {
  switch (attributeType) {
    case 'enum':
      return buildEnumAttributeDefinitions({
        prefix,
        amount,
        enumsAmount,
        labelLocalesAmount,
        mustHaveLocales,
      })
    case 'lenum':
      return buildEnumAttributeDefinitions({
        prefix,
        amount,
        enumsAmount,
        labelLocalesAmount,
        localesAmount,
        mustHaveLocales,
        isLenum: true,
      })
    case 'set':
      return buildSetAttributeDefinitions({
        prefix,
        amount,
        labelLocalesAmount,
        mustHaveLocales,
      })
    default:
      return buildAttributeDefinitions({
        prefix,
        attributeType,
        amount,
        labelLocalesAmount,
        mustHaveLocales,
      })
  }
}

function buildEnumAttributeDefinitions({
  prefix,
  amount,
  enumsAmount,
  labelLocalesAmount,
  localesAmount = 1,
  mustHaveLocales = [],
  isLenum,
}) {
  const attributeDefinitions = []
  for (let i = 1; i <= amount; i++) {
    const values = []

    const random = (n) => `${randomWord()}_enum_${n}`
    for (let j = 1; j <= enumsAmount; j++) {
      const key = random(j)
      const label = random(j)
      if (isLenum) {
        values.push({
          key,
          label: generateLabelLocales(localesAmount, mustHaveLocales, label),
        })
      } else {
        values.push({ key, label })
      }
    }

    const typeName = isLenum ? 'lenum' : 'enum'
    const name = `${prefix}_${randomWord()}_${typeName}_${i}`
    attributeDefinitions.push({
      name,
      label: generateLabelLocales(labelLocalesAmount, mustHaveLocales, name),
      isRequired: false,
      isSearchable: randomBoolean(),
      type: {
        name: typeName,
        values,
      },
      attributeConstraint: 'None',
    })
  }
  return attributeDefinitions
}

function buildSetAttributeDefinitions({
  prefix,
  amount,
  labelLocalesAmount,
  mustHaveLocales,
}) {
  const attributeDefinitions = []
  for (let i = 1; i <= amount; i++) {
    const name = `${prefix}_set_${i}`
    // does not supports set of set type
    const attributeType =
      attributeTypeList[randomNumber(0, attributeTypeList.length - 1)]
    const { type: elementType } = buildRandomAttributeDefinitionDraft(
      name,
      attributeType,
      labelLocalesAmount,
      mustHaveLocales,
      {
        amount: 1,
        enumsAmount: i,
      }
    )[0]

    attributeDefinitions.push({
      name,
      label: generateLabelLocales(labelLocalesAmount, mustHaveLocales, name),
      isRequired: false,
      isSearchable: randomBoolean(),
      type: {
        name: 'set',
        elementType,
      },
      attributeConstraint: 'None',
    })
  }

  return attributeDefinitions
}

function buildAttributeDefinitions({
  prefix,
  attributeType,
  amount,
  labelLocalesAmount,
  mustHaveLocales,
}) {
  const attributeDefinitions = []
  for (let i = 1; i <= amount; i++) {
    const name = `${prefix}_${attributeType}_${i}`
    attributeDefinitions.push({
      name,
      label: generateLabelLocales(labelLocalesAmount, mustHaveLocales, name),
      isRequired: false,
      isSearchable: randomBoolean(),
      type: {
        name: attributeType,
      },
      attributeConstraint: 'None',
    })
  }

  return attributeDefinitions
}

function addMoreAttributeDefinitionsRandomly(
  prefix,
  min,
  max,
  localesAmount,
  mustHaveLocales,
  attributeTypes,
  currentTotal
) {
  const attributeDefinitions = []
  const addMore = randomNumber(Math.max(min, currentTotal), max) - currentTotal
  for (let i = 0; i < addMore; i++) {
    const attributeType = findNextAttributeType(attributeTypes)
    const uniquePrefix = `${prefix}_more_${i + 1}`
    attributeDefinitions.push(
      ...buildRandomAttributeDefinitionDraft(
        uniquePrefix,
        attributeType,
        localesAmount,
        mustHaveLocales,
        {
          amount: 1,
          enumsAmount: addMore,
        }
      )
    )
  }
  return attributeDefinitions
}

function findNextAttributeType(attributeTypes) {
  const definedTypes = Object.keys(attributeTypes)
  const hasAllTypes =
    attributeTypeList.filter((t) => !definedTypes.includes(t)).length === 0
  const attributeType =
    attributeTypeList[randomNumber(0, attributeTypeList.length)]
  if (hasAllTypes) {
    return attributeType
  }
  return !definedTypes.includes(attributeType)
    ? attributeType
    : findNextAttributeType(attributeTypes)
}

function generateLabelLocales(
  labelLocalesAmount = 1,
  mustHaveLocales = [],
  label
) {
  const labels = {}
  const locales = new Set()
  mustHaveLocales.forEach((locale) => {
    locales.add(locale)
  })
  while (locales.size < labelLocalesAmount) {
    const countryCode = randomCountryCode()
    if (!locales.has(countryCode)) {
      locales.add(countryCode)
    }
  }
  for (const locale of Array.from(locales.values()).splice(
    0,
    labelLocalesAmount
  )) {
    labels[`${locale}`] = label
  }
  return labels
}

module.exports = {
  buildProductTypeDraft,
}
