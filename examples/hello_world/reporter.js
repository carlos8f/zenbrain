var colors = require('colors')

module.exports = function container (get, set, clear) {
  return function reporter (tick, cb) {
    if (!tick.data.colors) return cb()
    var ticker = tick.data.colors.map(function (color) { return color[color] }).join(', '.grey)
    get('logger').info('reporter', 'colors used:'.grey, ticker)
    cb()
  }
}