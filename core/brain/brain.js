module.exports = function container (get, set, clear) {
  var apply_funcs = get('utils.apply_funcs')
  return {
    handle_tick: function (tick, cb) {
      if (!rs.first_tick) rs.first_tick = tick
      apply_funcs(get('tick_handlers'), tasks, function (err) {
        if (err) return cb(err)
        rs.last_tick = tick
        cb()
      })
    },
    report: function (cb) {
      apply_funcs(get('reporters'), function (err) {
        if (err) return cb(err)
        cb()
      })
    }
  }
}