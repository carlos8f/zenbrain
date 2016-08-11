module.exports = function container (get, set, clear) {
  return function learner (cb) {
    cb()
  }
}