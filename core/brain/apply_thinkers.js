module.exports = function container (get, set, clear) {
  var c = get('config')
  var apply_funcs = get('utils.apply_funcs')
  return function apply_thinkers (tick, cb) {
    apply_funcs(tick, get('thinkers'), cb)
  }
}