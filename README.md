# commercetools-api-load-testing

Changes by Fernando

In order to protect our platform and ensure the quality of a customer’s solution, we created this repository to be able to replicate the usage of the platform with load test scenarios.

The repository provides two load testing solutions. The `main` and maintained branch is based on [k6](https://k6.io/docs/#what-is-k6) load testing tool. The load tests based on [locust](https://docs.locust.io/en/stable/index.html) tool could be found in the `locust` [branch](https://github.com/commercetools/commercetools-api-load-testing/tree/locust).

For customer-specific load test scenarios, please navigate to the existing customer-specific branch and follow its readme because every branch will have its own documentation for project-specific flow on how to execute tests.

If you are creating a new customer-specific load testing scenario, please use the following branch naming convention: [customerName]_[context].

## Guides

- Follow [data generation guide](/data-generation/README.md) in order to run the data generation which fills the project with the pre-defined data required for specific load test scenarios.
- Follow [load tests guide](./load-tests/README.md) in order to learn more details about the existing load test scenarios.
- Follow [running load tests](./scripts/running-load-tests.md) in order to create a GCP load testing environment and execute the load tests.

## Test results

Test results will be committed to the test-results branch (e.g: `results/project-key/many-discount-codes_2021-05-28_09-08-04.txt`).
Follow the [test-results branch](https://github.com/commercetools/commercetools-api-load-testing/tree/test-results) for more details.
