const bunyan = require('bunyan')
const { getLogLevel, getClientConfig } = require('./config')
const packageJson = require('../package.json')

let logger

function getLogger() {
  if (!logger)
    logger = bunyan.createLogger({
      name: `${packageJson.name}/${packageJson.version}`,
      stream: process.stderr,
      level: getLogLevel(),
      commercetools_project_key: getClientConfig().projectKey,
    })
  return logger
}

module.exports = {
  getLogger,
}
