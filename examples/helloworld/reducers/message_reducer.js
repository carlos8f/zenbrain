module.exports = function container (get, set, clear) {
  return function message_reducer (cb) {
    cb()
  }
}