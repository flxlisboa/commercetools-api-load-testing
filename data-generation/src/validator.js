const Ajv = require('ajv')
const logger = require('./logger').getLogger()

const ajv = new Ajv({ allErrors: true })

ajv.addKeyword({
  keyword: 'totalAmountsValidator',
  errors: true,
  validate: function totalAmountsValidator(value, data) {
    totalAmountsValidator.errors = []
    const { min, max, attributeTypes } = data
    validateMinMax(totalAmountsValidator, min, max)

    const attTypeAmountsSum = Object.keys(attributeTypes || []).reduce(
      (accumulator, currentValue) =>
        accumulator + (attributeTypes[currentValue].amount || 0),
      0
    )

    if (attTypeAmountsSum > max) {
      totalAmountsValidator.errors.push({
        keyword: 'attributeTypes',
        message:
          "total sum of 'amount' values in 'randomizedAttributes/attributeTypes' properties should be " +
          "less than 'max' property of 'randomizedAttributes'",
      })
    }
  },
})

ajv.addKeyword({
  keyword: 'minMaxValidator',
  errors: true,
  validate: function minMaxValidator(value, data) {
    const { min, max } = data
    minMaxValidator.errors = []
    validateMinMax(minMaxValidator, min, max)
  },
})

ajv.addKeyword({
  keyword: 'minCentMaxCentValidator',
  errors: true,
  validate: function minCentMaxCentValidator(value, data) {
    const { minCentAmount, maxCentAmount } = data
    minCentMaxCentValidator.errors = []
    validateMinMax(
      minCentMaxCentValidator,
      minCentAmount,
      maxCentAmount,
      'minCentAmount',
      'maxCentAmount'
    )
  },
})

function validateMinMax(
  errorContainer,
  min,
  max,
  minName = 'min',
  maxName = 'max'
) {
  if (max < min) {
    errorContainer.errors.push({
      keyword: maxName,
      message: `'${maxName}' property should be greater than '${minName}' property`,
    })
  }
}

function validateConfig(schema, config) {
  const validate = ajv.compile(schema)
  if (!config) {
    logger.info('Config is not set, skipping the data generation.')
    return { skip: true }
  }
  if (config.active === false) {
    logger.info('Config is not active, skipping the data generation.')
    return { skip: true }
  }
  const valid = validate(config)
  if (!valid) {
    logger.info(
      { errors: validate.errors },
      'Config is not valid, skipping the data generation'
    )
    return { skip: true, valid: false }
  }

  return { skip: false }
}

module.exports = { validateConfig }
