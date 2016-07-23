module.exports = function container (get, set, clear) {
  var c = get('constants')
  var apply_funcs = get('utils.apply_funcs')
  return function tick_handler (tick, cb) {
    tick.seen = true
    if (tick.size !== c.brain_speed) return cb()
    apply_funcs(get('thinkers'), tick, cb)
  }
}