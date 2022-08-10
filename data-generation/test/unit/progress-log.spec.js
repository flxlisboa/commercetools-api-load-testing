const { expect } = require('chai')
const ProgressLog = require('../../src/progress-log')

describe('Progress logger', () => {
  const testProgress = (totalItems, expectedLogsCount) => {
    const logs = []

    const progressLog = new ProgressLog((progress, processed, total) =>
      logs.push(`${progress}% (${processed}/${total})`)
    )

    progressLog.setTotal(totalItems)
    Array(totalItems)
      .fill()
      .map(() => progressLog.increment())

    expect(logs.length).to.equal(expectedLogsCount)
    if (logs.length >= 100) {
      expect(logs[0]).to.contain('1%')
      expect(logs[99]).to.contain('100%')
    } else if (logs.length > 0) expect(logs[logs.length - 1]).to.contain('100%')
  }

  it('Should log progress on 5001 items', () => {
    testProgress(5001, 100)
  })

  it('Should log progress on 1 item', () => {
    testProgress(1, 1)
  })

  it('Should log progress on 99 items', () => {
    testProgress(99, 99)
  })

  it('Should not log progress on 0 items', () => {
    testProgress(0, 0)
  })
})
