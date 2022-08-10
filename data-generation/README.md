# Data generation

The data generation app creates randomized example data to be used for the load test scenarios. The app is creating the resources based on resource-specific configurations, for instance, one could define the number of resources to be created.

The app supports creating the following resources in commercetools:

- [ProductType](docs/product-types.md)
- [Products](docs/products.md)
- [Customer](docs/customers.md)
- [CartDiscount](docs/cart-discounts.md)
- [DiscountCode](docs/discount-codes.md)

## Running the app

All data generation configuration needs to be stored as a custom object on the commercetools platform.
In order for this to work the configuration needs to be saved with the key "**data-generation**" within the container "**load-test**":

```
{
  "container": "load-test",
  "key": "data-generation",
  "value": {
    ... // the actual configuration object
  }
}
```

The actual configuration is placed within the `value` key.

In addition to the configuration custom object, the following environment variables must be provided in order to run the application.

| Name                | Content                                                             | Required | Default value                                     |
| ------------------- | ------------------------------------------------------------------- | -------- | ------------------------------------------------- |
| `CTP_PROJECT_KEY`   | The unique `key` of the commercetools project.                      | YES      |                                                   |
| `CTP_CLIENT_ID`     | OAuth 2.0 `client_id` and can be used to obtain a token.            | YES      |                                                   |
| `CTP_CLIENT_SECRET` | OAuth 2.0 `client_secret` and can be used to obtain a token.        | YES      |                                                   |
| `CTP_API_URL`       | The commercetools HTTP API is hosted at that URL.                   | NO       | `https://api.europe-west1.gcp.commercetools.com`  |
| `CTP_AUTH_URL`      | The commercetools’ OAuth 2.0 service is hosted at that URL.         | NO       | `https://auth.europe-west1.gcp.commercetools.com` |
| `LOG_LEVEL`         | The log level (`trace`, `debug`, `info`, `warn`, `error`, `fatal`). | NO       | `info`                                            |
| `CONCURRENCY`       | Number of concurrently running resource creation operations         | NO       | 4                                                 |

> Note: If you don't have the commercetools OAuth credentials, [create a commercetools API Client](https://docs.commercetools.com/tutorials/getting-started#creating-an-api-client).

Follow [deployment to GKE guide](./k8s/README.md) in order to deploy the app into the k8s cluster.

## Contribution

### Prerequisites

Minimum requirements are:

- **Node.js** version 14.

You can install all dependencies using `npm` with the following command:

```
npm install
```

### Development

While developing a project you can use some predefined commands for running tests, running linter, generating coverage or
autoformatting code.

- Execute `npm run test` to run all tests and print the code coverage report.
- Execute `npm run unit` to run unit tests.
- Execute `npm run integration` to run integration tests.
- Execute `npm run lint` to show lint errors in the code.
- Execute `npm run format` to auto-format files with prettier.
