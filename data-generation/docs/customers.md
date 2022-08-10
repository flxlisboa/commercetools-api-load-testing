# Customer data generation

The data generation app allows creating customers.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Configurations](#configurations)
  - [Properties](#properties)
- [Incremental fields](#incremental-fields)
- [Current restrictions](#current-restrictions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Configurations

In order for this to work the customer configuration with the valid properties needs to be added as the value of the custom object (key="**data-generation**" and container="**load-test**")

<details>
  <summary>Click to expand example configuration.</summary>

```json
{
  "container": "load-test",
  "key": "data-generation",
  "value": {
    "customers": {
      "amount": 100
    }
  }
}
```

</details>

### Properties

| Property Name | Description                                                                            | Required | Default value |
| ------------- | -------------------------------------------------------------------------------------- | -------- | ------------- |
| `amount`      | Total customers to be created                                                          | YES      |               |
| `active`      | Flag to activate/deactivate config. If set to false the customer generation is skipped | NO       | true          |

## Incremental fields

The `key` field of the customer has incremental values (such as `customer_1`, `customer_2`, ... `customer_N`) to make it easy to pick a random customer from a commercetools project.

## Current restrictions

- For a [CustomerDraft](https://docs.commercetools.com/api/projects/customers#customerdraft), only key and required fields (email, password) are set, optional fields such as firstname, lastname, etc are not set.
