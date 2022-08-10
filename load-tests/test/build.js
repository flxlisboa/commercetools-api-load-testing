import { sleep } from 'k6'
import { post, get } from '../src/client.js'
import { Rate } from 'k6/metrics'
import { buildContext } from '../src/context.js'

// https://k6.io/docs/using-k6/checks/#using-checks-in-a-ci-setting
export let errorRate = new Rate('errors')

// the script is created to ensure utilities working as expected.
// for local, run the command `k6 run --http-debug="full" test/build.js`
export default function (context) {
  const body = {
    container: 'load-test',
    key: 'ci',
    value: {
      key: 'value',
    },
  }
  const postResult = post({
    endpoint: 'custom-objects',
    action: 'createOrUpdateCustomObject',
    body,
    context,
  })

  if (postResult.error) errorRate.add(1)

  const getResult = get({
    endpoint: `custom-objects/${body.container}/${body.key}`,
    action: 'getCustomObjectByContainerAndKey',
    context,
  })

  if (getResult.error) errorRate.add(1)

  sleep(1)
}

export function setup() {
  return buildContext('ci')
}
