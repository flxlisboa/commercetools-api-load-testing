# Contribution Guide

## Contents

- [Prerequisites](#prerequisites)
- [Development](#development)

## Prerequisites

- In case k6 is not installed yet on your local:

  - For macos: Install with homebrew:
    ```bash
       brew install k6
    ```
  - Check the official k6 [installation](https://k6.io/docs/getting-started/installation/) docs for more details.

## Development

While developing a project you can use some predefined commands for running linter or autoformatting code.

- Execute `npm run lint` to show lint errors in the code.
- Execute `npm run format` to auto-format files with prettier.

### Environment variables

The following environment variables must be set in order to run the load tests.

| Name                | Content                                                      | Required | Default value                                     |
| ------------------- | ------------------------------------------------------------ | -------- | ------------------------------------------------- |
| `CTP_PROJECT_KEY`   | The unique `key` of the commercetools project.               | YES      |                                                   |
| `CTP_CLIENT_ID`     | OAuth 2.0 `client_id` and can be used to obtain a token.     | YES      |                                                   |
| `CTP_CLIENT_SECRET` | OAuth 2.0 `client_secret` and can be used to obtain a token. | YES      |                                                   |
| `CTP_API_URL`       | The commercetools HTTP API is hosted at that URL.            | NO       | `https://api.europe-west1.gcp.commercetools.com`  |
| `CTP_AUTH_URL`      | The commercetools’ OAuth 2.0 service is hosted at that URL.  | NO       | `https://auth.europe-west1.gcp.commercetools.com` |

### K6 commands

Run k6 using this command:

```bash
k6 run src/scenarios/template.js
```

Things don't always work as expected. For those cases there's a handy CLI flag, which prints the full http response body while the script is running:

```bash
k6 run --http-debug="full" src/scenarios/template.js
```

Check official [running k6](https://k6.io/docs/getting-started/running-k6/) docs for more details.

### Notes of developing/using k6

- The k6 is does not run in NodeJS or browser, so node_modules won't work.
- The debugging is not possible (as it's running inside k6 engine) so use loggers to trace the code.
- The code is using [local file system modules](https://k6.io/docs/using-k6/modules/#local-filesystem-modules) so putting `.js` on imports is required. (`import foo from 'foo.js'`)
