var colors = require('colors')

module.exports = function container (get, set, clear) {
  var get_tick_str = get('utils.get_tick_str')
  var str_to_color = get('utils.str_to_color')
  return function reporter (tick, rs, cb) {
    if (!tick.data.colors) return cb()
    var ticker = tick.data.colors.map(function (color) { return color[color] }).join(', '.grey)
    get('logger').info('reporter', get_tick_str(tick.id), 'colors used:'.grey, ticker)
    cb()
  }
}