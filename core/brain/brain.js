module.exports = function container (get, set, clear) {
  var apply_funcs = get('utils.apply_funcs')
  var rs = get('run_state')
  return {
    handle_tick: function (tick, cb) {
      if (!rs.first_tick) rs.first_tick = tick
      apply_funcs(tick, get('tick_handlers'), function (err) {
        if (err) return cb(err)
        rs.last_tick = tick
        cb()
      })
    },
    report: function (cb) {
      report = {}
      apply_funcs(report, get('reporters'), function (err) {
        if (err) return cb(err)
        cb(null, report)
      })
    }
  }
}