var colors = require('colors')

module.exports = function container (get, set, clear) {
  var get_tick_str = get('utils.get_tick_str')
  return function tick_reducer (g, cb) {
    var tick = g.tick, sub_tick = g.sub_tick
    var d = tick.data
    d.colors || (d.colors = [])
    d.messages || (d.messages = [])
    // migrate the sub tick's stuff to new tick
    d.colors = d.colors.concat(sub_tick.data.colors || [])
    ;(sub_tick.data.messages || []).forEach(function (message) {
      if (d.messages.indexOf(message) === -1) {
        d.messages.push(message)
      }
    })
    get('logger').info('reduce tick', get_tick_str(sub_tick.id), '->'.grey, get_tick_str(tick.id))
    cb(null, g)
  }
}