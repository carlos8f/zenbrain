var c = module.exports = {}
c.reducer_sizes = ["10s", "1m"]
c.reporter_sizes = ["1m"]
c.map_interval = 1000
c.reduce_timeout = 1000
c.passive_update_timeout = 1000
c.brain_speed_ms = 1000
c.logic = function container (get, set, clear) {
  var get_tick_str = get('utils.get_tick_str')
  return [
    function (tick, trigger, rs, cb) {
      get('logger').info('logic', get_tick_str(tick.id))
      if (!tick.data.messages || !tick.data.messages.length) return cb()
      trigger({
        type: 'console_log',
        text: tick.data.messages.join(' ')
      })
      cb()
    }
  ]
}