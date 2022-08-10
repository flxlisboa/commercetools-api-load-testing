# Cart discount data generation

The data generation app allows creating cart discounts.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Configurations](#configurations)
  - [Properties](#properties)
    - [requiresDiscountCode properties](#requiresdiscountcode-properties)
    - [appliesToAllCarts properties](#appliestoallcarts-properties)
    - [cartDiscountDrafts properties](#cartdiscountdrafts-properties)
- [Current restrictions](#current-restrictions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Configurations

In order for this to work the cart discount configuration with the valid properties needs to be added as the value of the custom object (key="**data-generation**" and container="**load-test**")

<details>
  <summary>Click to expand example configuration.</summary>

```json
{
  "container": "load-test",
  "key": "data-generation",
  "value": {
    "cartDiscounts": {
      "requiresDiscountCode": {
        "amount": 15,
        "cartDiscountDrafts": [
          {
            "isActive": true,
            "value": {
              "type": "relative",
              "permyriad": 3000
            },
            "cartPredicate": "1 = 1",
            "target": {
              "type": "lineItems",
              "predicate": "1 = 1"
            }
          },
          {
            "isActive": true,
            "value": {
              "type": "relative",
              "permyriad": 1500
            },
            "cartPredicate": "totalPrice > \"10.00 EUR\"",
            "target": {
              "type": "lineItems",
              "predicate": "1 = 1"
            }
          }
        ]
      },
      "appliesToAllCarts": {
        "amount": 5,
        "cartDiscountDrafts": [
          {
            "value": {
              "type": "relative",
              "permyriad": 1000
            },
            "target": {
              "type": "lineItems",
              "predicate": "attributes.computer_1_chips_lenum_1 in (\"sports_enum_3\",\"alarm_enum_5\")"
            }
          }
        ]
      }
    }
  }
}
```

</details>

### Properties

| Property Name          | Description                                                                                 | Required | Default value |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------- | ------------- |
| `active`               | Flag to activate/deactivate config. If set to false the cart discount generation is skipped | NO       | true          |
| `requiresDiscountCode` | Configuration object for the requiresDiscountCode                                           | NO       |               |
| `appliesToAllCarts`    | Configuration object for the appliesToAllCarts                                              | NO       |               |

##### requiresDiscountCode properties

The configuration for the cart discounts that can only be used in a connection with a DiscountCode.

| Property Name        | Description                                    | Required | Default value |
| -------------------- | ---------------------------------------------- | -------- | ------------- |
| `amount`             | Total cart discounts to be created             | YES      |               |
| `cartDiscountDrafts` | Configuration array for the cartDiscountDrafts | YES      |               |

##### appliesToAllCarts properties

The configuration for the cart discounts that applies to all carts that matches with cartPredicates, aka does not need be connected with a DiscountCode.

| Property Name        | Description                                                      | Required | Default value |
| -------------------- | ---------------------------------------------------------------- | -------- | ------------- |
| `amount`             | Total cart discounts to be created (should be between 1 and 100) | YES      |               |
| `cartDiscountDrafts` | Configuration array for the cartDiscountDrafts                   | YES      |               |

##### cartDiscountDrafts properties

| Property Name   | Description                                                                                                                                                                                                                                | Required | Default value |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------- |
| `cartPredicate` | [Cart Predicate](https://docs.commercetools.com/api/projects/predicates#cart-predicates) field identifiers reference fields on a Cart                                                                                                      | NO       | 1 = 1         |
| `isActive`      | Only active cart discount can be applied to the cart.                                                                                                                                                                                      | NO       | true          |
| `value`         | [CartDiscountValueDraft](https://docs.commercetools.com/api/projects/cartDiscounts#cartdiscountvaluedraft) representation, defines the effect the discount will have. For a target, relative or absolute discount values can be specified. | YES      |               |
| `target`        | [CartDiscountTargetDraft](https://docs.commercetools.com/api/projects/cartDiscounts#cartdiscounttarget) representation, defines what part of the cart will be discounted.                                                                  | YES      |               |

## Current restrictions

- For a [CartDiscountDraft](https://docs.commercetools.com/api/projects/cartDiscounts#cartdiscountdraft), optional fields such as `references`, `stackingMode`, `custom` won't be set.
