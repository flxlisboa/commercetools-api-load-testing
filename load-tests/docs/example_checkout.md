# Scenario: Example checkout workflow

The scenario has been designed to evaluate if the commercetools platform performs well with one of our customer Example for the checkout workflow.

The scenario contains the checkout flow, searching products, product detail view, creating a cart, adding line items and creating an order from the cart.

## How to run

- [Step 1](#step-1-data-generation): Prepare the commercetools project for the scenario with using data-generation module.
- [Step 2](#step-2-k6-options): Configure the k6 options, to change how k6 will behave during test execution.
- [Step 3](#step-3-execute-and-monitor-the-test): Execute the load test scenario and monitor during the execution.

### Step 1: Data generation

Follow [data generation guide](../../data-generation) in order to run the data generation which fills the project with the pre-defined data required for specific load test scenarios.

For this scenario you could use the example configuration below:

<details>
  <summary>Click to expand example custom object (configuration).</summary>

```json
{
  "container": "load-test",
  "key": "data-generation",
  "value": {
    "productTypes": {
      "amount": 1,
      "randomizedAttributes": {
        "min": 100,
        "max": 100,
        "localesAmount": 10,
        "mustHaveLocales": [
          "de-DE",
          "fr-FR",
          "es-ES",
          "it-IT",
          "nl-NL",
          "de-CH",
          "de-AT",
          "fr-BE",
          "en-DK",
          "de-PL"
        ],
        "attributeTypes": {
          "lenum": {
            "amount": 5,
            "enumsAmount": 10,
            "localesAmount": 3
          },
          "enum": {
            "amount": 5,
            "enumsAmount": 10
          }
        }
      },
      "commonAttributes": []
    },
    "products": {
      "amount": 300000,
      "variants": {
        "max": 5,
        "min": 5,
        "prices": {
          "randomizedPrices": {
            "min": 50,
            "max": 50,
            "minCentAmount": 1200,
            "maxCentAmount": 1800
          },
          "commonPrices": [
            {
              "value": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1000,
                "fractionDigits": 2
              },
              "country": "DE",
              "channel": {
                "key": "channel-DE"
              }
            },
            {
              "value": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1100,
                "fractionDigits": 2
              },
              "country": "CH",
              "channel": {
                "key": "channel-CH"
              }
            },
            {
              "value": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1100,
                "fractionDigits": 2
              },
              "country": "FR",
              "channel": {
                "key": "channel-FR"
              }
            },
            {
              "value": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1150,
                "fractionDigits": 2
              },
              "country": "NL",
              "channel": {
                "key": "channel-NL"
              }
            },
            {
              "value": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1000,
                "fractionDigits": 2
              },
              "country": "AT",
              "channel": {
                "key": "channel-AT"
              }
            },
            {
              "value": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1000,
                "fractionDigits": 2
              },
              "country": "BE",
              "channel": {
                "key": "channel-BE"
              }
            },
            {
              "value": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1100,
                "fractionDigits": 2
              },
              "country": "DK",
              "channel": {
                "key": "channel-DK"
              }
            },
            {
              "value": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1200,
                "fractionDigits": 2
              },
              "country": "IT",
              "channel": {
                "key": "channel-IT"
              }
            },
            {
              "value": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1240,
                "fractionDigits": 2
              },
              "country": "ES",
              "channel": {
                "key": "channel-ES"
              }
            },
            {
              "value": {
                "type": "centPrecision",
                "currencyCode": "EUR",
                "centAmount": 1100,
                "fractionDigits": 2
              },
              "country": "PL",
              "channel": {
                "key": "channel-PL"
              }
            }
          ]
        }
      }
    }
  }
}
```

</details>

This config will create 1 product type with 100 attributes and 300.000 products with 5 variants and 50 prices per product.

The data generation app will require at least 1 tax category to be able to create products, for that you could use the example tax category below:

<details>
  <summary>Click to expand example tax category draft.</summary>

```json
{
  "name": "standard",
  "key": "standard",
  "rates": [
    {
      "name": "19% MwSt",
      "amount": 0.19,
      "includedInPrice": true,
      "country": "DE",
      "id": "eZft-ZY7",
      "subRates": []
    },
    {
      "name": "21%",
      "amount": 0.21,
      "includedInPrice": true,
      "country": "ES",
      "id": "pilFgrzC",
      "subRates": []
    },
    {
      "name": "20%",
      "amount": 0.2,
      "includedInPrice": true,
      "country": "FR",
      "id": "9Wcs-BJv",
      "subRates": []
    },
    {
      "name": "22%",
      "amount": 0.22,
      "includedInPrice": true,
      "country": "IT",
      "id": "WStKRaz6",
      "subRates": []
    },
    {
      "name": "21%",
      "amount": 0.21,
      "includedInPrice": true,
      "country": "NL",
      "id": "W03pxn1C",
      "subRates": []
    },
    {
      "name": "20%",
      "amount": 0.2,
      "includedInPrice": true,
      "country": "AT",
      "id": "7uXH8tXO",
      "subRates": []
    },
    {
      "name": "7,7%",
      "amount": 0.077,
      "includedInPrice": true,
      "country": "CH",
      "id": "oGQ3oWdh",
      "subRates": []
    },
    {
      "name": "21%",
      "amount": 0.21,
      "includedInPrice": true,
      "country": "BE",
      "id": "YYQYbFhC",
      "subRates": []
    },
    {
      "name": "25%",
      "amount": 0.25,
      "includedInPrice": true,
      "country": "DK",
      "id": "wnaXl457",
      "subRates": []
    },
    {
      "name": "23%",
      "amount": 0.23,
      "includedInPrice": true,
      "country": "PL",
      "id": "wnaXl457",
      "subRates": []
    }
  ]
}
```

</details>

In addition to the tax category the scenario requires using stores, and distribution channels to be created before.

<details>
  <summary>Click to expand project info</summary>

```json
{
  "countries": ["CH", "DE", "FR", "NL", "AT", "BE", "DK", "IT", "ES", "PL"],
  "currencies": ["EUR", "USD"],
  "languages": [
    "de-DE",
    "fr-FR",
    "es-ES",
    "it-IT",
    "nl-NL",
    "de-CH",
    "de-AT",
    "fr-BE",
    "en-DK",
    "de-PL"
  ]
}
```

</details>

<details>
  <summary>Click to expand channels</summary>

```json
[
  {
    "key": "channel-DE",
    "roles": ["ProductDistribution"]
  },
  {
    "key": "channel-CH",
    "roles": ["ProductDistribution"]
  },
  {
    "key": "channel-FR",
    "roles": ["ProductDistribution"]
  },
  {
    "key": "channel-NL",
    "roles": ["ProductDistribution"]
  },
  {
    "key": "channel-AT",
    "roles": ["ProductDistribution"]
  },
  {
    "key": "channel-BE",
    "roles": ["ProductDistribution"]
  },
  {
    "key": "channel-DK",
    "roles": ["ProductDistribution"]
  },
  {
    "key": "channel-IT",
    "roles": ["ProductDistribution"]
  },
  {
    "key": "channel-ES",
    "roles": ["ProductDistribution"]
  },
  {
    "key": "channel-PL",
    "roles": ["ProductDistribution"]
  }
]
```

</details>

<details>
  <summary>Click to expand stores</summary>

```json
[
  {
    "key": "store-DE",
    "languages": ["de-DE"],
    "distributionChannels": [
      {
        "key": "channel-DE"
      }
    ]
  },
  {
    "key": "store-CH",
    "languages": ["de-CH"],
    "distributionChannels": [
      {
        "key": "channel-CH"
      }
    ]
  },
  {
    "key": "store-FR",
    "languages": ["fr-FR"],
    "distributionChannels": [
      {
        "key": "channel-FR"
      }
    ]
  },
  {
    "key": "store-NL",
    "languages": ["nl-NL"],
    "distributionChannels": [
      {
        "key": "channel-NL"
      }
    ]
  },
  {
    "key": "store-AT",
    "languages": ["de-AT"],
    "distributionChannels": [
      {
        "key": "channel-AT"
      }
    ]
  },
  {
    "key": "store-BE",
    "languages": ["fr-BE"],
    "distributionChannels": [
      {
        "key": "channel-BE"
      }
    ]
  },
  {
    "key": "store-DK",
    "languages": ["en-DK"],
    "distributionChannels": [
      {
        "key": "channel-DK"
      }
    ]
  },
  {
    "key": "store-IT",
    "languages": ["it-IT"],
    "distributionChannels": [
      {
        "key": "channel-IT"
      }
    ]
  },
  {
    "key": "store-ES",
    "languages": ["es-ES"],
    "distributionChannels": [
      {
        "key": "channel-ES"
      }
    ]
  },
  {
    "key": "store-PL",
    "languages": ["de-PL"],
    "distributionChannels": [
      {
        "key": "channel-PL"
      }
    ]
  }
]
```

</details>

### Step 2: k6 options

[k6 options](https://k6.io/docs/using-k6/options/#list-of-options) allow you to configure how k6 will behave during test execution.

| Name                | Content                                                                                                 | Default value                 |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `vus`               | A number specifying the number of VUs to run concurrently                                               | 1                             |
| `duration`          | A string specifying the total duration of the test run                                                  | -                             |
| `summaryTrendStats` | Define stats for trend metrics in the end-of-test summary.                                              | `avg,min,med,max,p(90),p(95)` |
| `stages`            | A list of VU objects that specify the target number of VUs to ramp up or down to for a specific period. | -                             |

Edit the [k6 configuration](../configs/Example_checkout.json) of the scenario with inspiring the example configurations below.

#### Example configuration:

With the following configuration, you could simulate ramp-up of traffic from 1 to 5000 users over 5 minutes.
Then stay at 5000 concurrent users for 2 minutes.

```json
{
  "stages": [
    { "duration": "5m", "target": 5000 },
    { "duration": "2m", "target": 5000 }
  ],
  "summaryTrendStats": ["avg", "min", "med", "max", "p(95)", "p(99)", "count"]
}
```

### Step 3: Execute and monitor the test

The following environment variables must be provided in order to run the load tests, set the environment variables in the [set-envs.sh](../set-envs.sh) script.

| Name                | Content                                                      | Required | Default value                                     |
| ------------------- | ------------------------------------------------------------ | -------- | ------------------------------------------------- |
| `CTP_PROJECT_KEY`   | The unique `key` of the commercetools project.               | YES      |                                                   |
| `CTP_CLIENT_ID`     | OAuth 2.0 `client_id` and can be used to obtain a token.     | YES      |                                                   |
| `CTP_CLIENT_SECRET` | OAuth 2.0 `client_secret` and can be used to obtain a token. | YES      |                                                   |
| `CTP_API_URL`       | The commercetools HTTP API is hosted at that URL.            | NO       | `https://api.europe-west1.gcp.commercetools.com`  |
| `CTP_AUTH_URL`      | The commercetools’ OAuth 2.0 service is hosted at that URL.  | NO       | `https://auth.europe-west1.gcp.commercetools.com` |

> Note: If you don't have the commercetools OAuth credentials, [create a commercetools API Client](https://docs.commercetools.com/tutorials/getting-started#creating-an-api-client).

#### Execution

Follow [running load tests](../../scripts/running-load-tests.md) in order to create a GCP load testing environment and execute the load tests.
The test results will be committed to the [test-results](https://github.com/commercetools/commercetools-api-load-testing/tree/test-results) branch (e.g: `results/project-key/Example_checkout_2021-05-28_09-08-04.txt`).
