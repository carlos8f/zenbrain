module.exports = function container (get, set, clear) {
  var apply_funcs = get('utils.apply_funcs')
  return function runner (tick, rs, cb) {
    apply_funcs(tick, rs, get('tick_handlers'), function (err) {
      if (err) return cb(err)
      apply_funcs(tick, rs, get('reporters'), cb)
    })
  }
}