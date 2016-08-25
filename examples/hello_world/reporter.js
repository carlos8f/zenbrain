module.exports = function container (get, set, clear) {
  var get_tick_str = get('utils.get_tick_str')
  return function reporter (tick, rs, cb) {
    get('logger').info('reporter', get_tick_str(tick.id))
    cb()
  }
}