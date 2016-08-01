module.exports = function container (get, set, clear) {
  var apply_funcs = get('utils.apply_funcs')
  return function runner (tick, cb) {
    get('logger').info('runner', tick.id)
    apply_funcs(tick, get('tick_handlers'), function (err) {
      if (err) return cb(err)
      apply_funcs(tick, get('reporters'), cb)
    })
  }
}