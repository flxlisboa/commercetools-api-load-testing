# Discount code data generation

The data generation app allows creating discount codes with supporting randomization.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Prerequisites](#prerequisites)
- [Configurations](#configurations)
  - [Properties](#properties)
    - [randomizedDiscountCodes properties](#randomizeddiscountcodes-properties)
- [Incremental fields](#incremental-fields)
- [Current restrictions](#current-restrictions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Prerequisites

In order to create a discount, the referenced matching `cart discounts` with `requiresDiscountCode = true` must exist in project.

## Configurations

In order for this to work the discount code configuration with the valid properties needs to be added as the value of the custom object (key="**data-generation**" and container="**load-test**")

<details>
  <summary>Click to expand example configuration.</summary>

```json
{
  "container": "load-test",
  "key": "data-generation",
  "value": {
    "discountCodes": {
      "randomizedDiscountCodes": {
        "amount": 1,
        "cartPredicate": "totalPrice > \"5.00 EUR\""
      }
    }
  }
}
```

</details>

### Properties

| Property Name             | Description                                                                                 | Required | Default value |
| ------------------------- | ------------------------------------------------------------------------------------------- | -------- | ------------- |
| `active`                  | Flag to activate/deactivate config. If set to false the discount code generation is skipped | NO       | true          |
| `randomizedDiscountCodes` | Configuration object for the randomizedDiscountCodes                                        | YES      |               |

#### randomizedDiscountCodes properties

| Property Name                | Description                                                                                                                                         | Required | Default value |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------- |
| `amount`                     | Total discount codes to be created with randomized data                                                                                             | YES      |               |
| `cartPredicate`              | The discount code can only be applied to carts that match this [predicate](https://docs.commercetools.com/api/projects/predicates#cart-predicates). | NO       |               |
| `maxApplicationsPerCustomer` | The discount code can only be applied `maxApplicationsPerCustomer` times per customer.                                                              | NO       |               |

## Incremental fields

The `code` field of the discount code has incremental values (such as `1`, `2`, `3` ... `N`) to make it easy to pick a random discount code from a commercetools project.

## Current restrictions

- Optional fields [DiscountCodeDraft](https://docs.commercetools.com/api/projects/discountCodes#discountcodedraft) such as `group`, `maxApplications` and `custom` won't be set.
- All discount codes `isActive=true`
