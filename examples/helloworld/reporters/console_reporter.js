module.exports = function container (get, set, clear) {
  return function console_reporter (cb) {
    cb()
  }
}