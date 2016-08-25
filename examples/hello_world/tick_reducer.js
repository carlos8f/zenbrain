module.exports = function container (get, set, clear) {
  var get_tick_str = get('utils.get_tick_str')
  return function tick_reducer (g, cb) {
    var tick = g.tick, sub_tick = g.sub_tick
    get('logger').info('tick_reducer', get_tick_str(tick.id), '->', get_tick_str(tick.id))
    var d = tick.data, sd = sub_tick.data
    d.messages || (d.messages = [])
    ;(sd.messages || []).forEach(function (message) {
      d.messages.push(message)
    })
    cb(null, g)
  }
}