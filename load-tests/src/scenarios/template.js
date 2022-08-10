import { sleep } from 'k6'

import { buildContext } from '../context.js'
import { buildLogger } from '../logger.js'

const scenarioName = 'scenarioName'
const logger = buildLogger(scenarioName)

// note: options should be designed specific to the scenario.
// see: https://k6.io/docs/using-k6/options/#list-of-options
export let options = {
  vus: 2, //  number specifying the number of VUs to run concurrently
  duration: '1s',
  // Define which stats for Trend metrics will be shown in the end-of-test summary.
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(95)', 'p(99)', 'count'],
  // specify the performance expectations of the system under test
  // when the thresholds are not passed the test will fail with a non-zero exit code.
  thresholds: {
    // http errors should be less than 1%
    http_req_failed: ['rate<0.01'],
    // 95% of requests must finish within 800ms, and 99% within 2s.
    http_req_duration: ['p(95) < 800', 'p(99) < 2000'],
  },
}

// Code inside default function is called "VU code",
// and is run over and over for as long as the test is running.
// see: https://k6.io/docs/using-k6/test-life-cycle/#init-and-vu-stages
// see: https://k6.io/docs/using-k6/test-life-cycle/#the-default-function-life-cycle
export default function (context) {
  // write/run the test scenario functions here
  logger.info(context)
  try {
    throw new Error('message')
  } catch (err) {
    logger.error(err, 'unexpected error')
  }

  // once the VU reaches the end of the default function
  // it will loop back to the start and execute the code all over.
  // Make sure to use sleep() statements to pace your VUs properly.
  sleep(1)
}

// run once per test
// see: https://k6.io/docs/using-k6/test-life-cycle/#setup-and-teardown-stages
export function setup() {
  logger.info(`The ${scenarioName} is started`)
  const context = buildContext(scenarioName)
  logger.info(`X-Correlation-ID header prefix: k6-load-test/${context.journey}`)
  return context
}

// run once per test
// see: https://k6.io/docs/using-k6/test-life-cycle/#setup-and-teardown-stages
export function teardown(context) {
  logger.info(`The ${scenarioName} is completed`)
  logger.info(`X-Correlation-ID header prefix: k6-load-test/${context.journey}`)
}
