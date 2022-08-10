# Product type data generation

The data generation app allows creating product types with supporting randomization based on the attribute definitions.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Configurations](#configurations)
  - [Properties](#properties)
    - [randomizedAttributes properties](#randomizedattributes-properties)
      - [attributeTypes properties](#attributetypes-properties)
    - [commonAttributes properties](#commonattributes-properties)
- [Current restrictions](#current-restrictions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Configurations

In order for this to work the product type configuration with the valid properties needs to be added as the value of the custom object (key="**data-generation**" and container="**load-test**")

<details>
  <summary>Click to expand example configuration.</summary>

```json
{
  "container": "load-test",
  "key": "data-generation",
  "value": {
    "productTypes": {
      "amount": 100,
      "randomizedAttributes": {
        "min": 10,
        "max": 30,
        "localesAmount": 3,
        "attributeTypes": {
          "lenum": {
            "amount": 5,
            "enumsAmount": 50,
            "localesAmount": 3
          },
          "enum": {
            "amount": 10,
            "enumsAmount": 30
          }
        }
      },
      "commonAttributes": [
        {
          "name": "att1",
          "label": {
            "de-DE": "att1"
          },
          "isRequired": false,
          "type": {
            "name": "ltext"
          }
        }
      ]
    }
  }
}
```

</details>

### Properties

| Property Name          | Description                                                                                | Required | Default value |
| ---------------------- | ------------------------------------------------------------------------------------------ | -------- | ------------- |
| `amount`               | Total product types to be created                                                          | YES      |               |
| `active`               | Flag to activate/deactivate config. If set to false the product type generation is skipped | NO       | true          |
| `randomizedAttributes` | Configuration object for the randomizedAttributes                                          | YES      |               |
| `commonAttributes`     | Configuration array for the commonAttributes                                               | YES      |               |

#### randomizedAttributes properties

| Property Name                        | Description                                                                                                                   | Required | Default value |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | -------- | ------------- |
| `min`                                | Min number of attributes for each product type                                                                                | YES      |               |
| `max`                                | Max number of attributes for each product type                                                                                | YES      |               |
| `localesAmount`                      | Number of locales that will be used for localizedString attributes                                                            | NO       | 1             |
| `mustHaveLocales`                    | Locales/languages you want to ensure to be used in attribute labels, if it less than `max` others will have random languages. | NO       | []            |
| `attributeTypes`                     | Configuration object for each [attribute type](https://docs.commercetools.com/api/projects/productTypes#attributetype)        | NO       |               |
| `attributeTypes.[attributeTypeName]` | Supported names: [ boolean, text, ltext, enum, lenum, number, money, date, time, datetime, set]                               | NO       |               |

##### attributeTypes properties

| Property Name   | Description                                                                                                                                                                     | Required | Default value |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------- |
| `amount`        | Total amount of attribute for the attribute type                                                                                                                                | YES      |               |
| `enumsAmount`   | Total amount of enum value pairs for the `enum` and `lenum` attribute types. This is a mandatory property, if `enum` or `lenum` is being defined in the product-type definition |          |               |
| `localesAmount` | Number of locales that will be generated for `lenum` attribute values                                                                                                           | NO       | 1             |

#### commonAttributes properties

Array of [AttributeDefinitionDrafts](https://docs.commercetools.com/api/projects/productTypes#attributedefinitiondraft) to be created part of every product type.

## Current restrictions

- Creating `nested` attribute type is not supported yet.
- Creating `reference` attribute type is not supported yet.
- Creating `attribute constraints` is not supported yet.
