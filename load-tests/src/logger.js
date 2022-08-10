import { getClientConfig } from './config.js'

// todo obscure the token and bearer info in request.
class Logger {
  constructor(scenarioName) {
    this.projectKey = getClientConfig().projectKey
    this.scenarioName = scenarioName
  }

  info(msg, correlationId) {
    const logEntry = this.buildLogEntry('INFO', msg)
    if (correlationId) {
      logEntry.correlationId = correlationId
    }
    console.log(JSON.stringify(logEntry))
  }

  error(err, msg, correlationId) {
    const logEntry = this.buildLogEntry('ERROR', msg)
    if (err) {
      logEntry.err = err
    }
    if (correlationId) {
      logEntry.correlationId = correlationId
    }
    console.error(JSON.stringify(logEntry, this.replaceErrors))
  }

  buildLogEntry(severity, msg) {
    return {
      projectKey: this.projectKey,
      scenarioName: this.scenarioName,
      severity,
      msg,
    }
  }

  replaceErrors(key, value) {
    if (value instanceof Error) {
      const error = {}

      // note: in k6 the stack is always undefined.
      Object.getOwnPropertyNames(value).forEach(function (propName) {
        error[propName] = value[propName]
      })

      return error
    }

    return value
  }
}

export function buildLogger(scenarioName) {
  return new Logger(scenarioName)
}
