# Product data generation

The data generation app allows creating products with supporting randomization.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Prerequisites](#prerequisites)
- [Configurations](#configurations)
  - [Properties](#properties)
  - [variants properties](#variants-properties)
  - [prices properties](#prices-properties)
  - [randomizedPrices properties](#randomizedprices-properties)
- [Incremental fields](#incremental-fields)
- [Current restrictions](#current-restrictions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Prerequisites

In order to create a product, following resources must exist in the project:

1. product type
1. tax category

## Configurations

In order for this to work the product configuration with the valid properties needs to be added inside the value of the custom object (key="**data-generation**" and container="**load-test**")

<details>
  <summary>Click to expand example configuration.</summary>

```json
{
  "products": {
    "amount": 100,
    "variants": {
      "max": 5,
      "min": 5,
      "prices": {
        "randomizedPrices": {
          "min": 10,
          "max": 20,
          "minCentAmount": 0,
          "maxCentAmount": 1000
        },
        "commonPrices": [
          {
            "value": {
              "type": "centPrecision",
              "currencyCode": "EUR",
              "centAmount": 0,
              "fractionDigits": 2
            },
            "country": "AT"
          }
        ]
      }
    }
  }
}
```

</details>

### Properties

| Property Name | Description                                                                           | Required | Default value |
| ------------- | ------------------------------------------------------------------------------------- | -------- | ------------- |
| `amount`      | Total products to be created                                                          | YES      |               |
| `active`      | Flag to activate/deactivate config. If set to false the product generation is skipped | NO       | true          |
| `variants`    | Configuration object for product variants                                             |          |               |

### variants properties

| Property Name | Description                     | Required | Default value |
| ------------- | ------------------------------- | -------- | ------------- |
| `min`         | Minimum number of variants      |          | 1             |
| `max`         | Maximum number of variants      |          | 1             |
| `prices`      | Configuration object for prices |          |               |

### prices properties

| Property Name      | Description                                            | Required | Default value |
| ------------------ | ------------------------------------------------------ | -------- | ------------- |
| `randomizedPrices` | Configuration object for randomizedPrices              |          |               |
| `commonPrices`     | Array of prices to be created in every product variant |          | []            |

### randomizedPrices properties

| Property Name     | Description                                                                                                | Required | Default value |
| ----------------- | ---------------------------------------------------------------------------------------------------------- | -------- | ------------- |
| min               | Minimum number of prices                                                                                   |          | 0             |
| max               | Maximum number of prices                                                                                   |          | 0             |
| minCentAmount     | Minimum cent amount value for every price                                                                  |          | 0             |
| maxCentAmount     | Maximum cent amount value for every price                                                                  |          |               |
| mustHaveCountries | Countries you want to ensure to be created, if it less than `max` other prices will have random countries. |          | []            |
| currencies        | Currencies you want to create prices, if not set currency will be selected randomly.                       |          | []            |

## Incremental fields

The `sku` field of the product variant has incremental values (such as `1`, `2`, `3` ... `N`) to make it easy to pick a random variant from a commercetools project.

## Current restrictions

- Products can have only tax category attribute.
- Product variants can have only prices.
- Product attributes are created with random values according to the product types available in the project.
