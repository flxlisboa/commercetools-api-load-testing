class ProgressLog {
  constructor(logCb, total = 0) {
    this.lastLoggedProgress = 0
    this.logCb = logCb
    this.total = total
    this.counter = 0
  }

  setTotal(total) {
    this.total = total
  }

  log(processed) {
    const progress = this.total
      ? Math.floor((processed / this.total) * 100)
      : 100

    if (this.lastLoggedProgress !== progress) {
      this.logCb(progress, processed, this.total)
      this.lastLoggedProgress = progress
    }
  }

  increment() {
    this.log(++this.counter)
  }
}

module.exports = ProgressLog
