var colors = require('colors')

module.exports = function container (get, set, clear) {
  var reducer = get('reducer')
  var c = get('core.constants')
  var currently_idle = false
  return function reduce () {
    reducer(function (err, idle) {
      if (err) {
        get('logger').error('reduce err', err, {feed: 'errors'})
      }
      if (idle && !currently_idle) {
        currently_idle = true
        get('logger').info('reduce', 'idle'.grey)
      }
      else if (!idle) {
        currently_idle = false
      }
      setTimeout(function () {
        reduce()
      }, idle ? c.brain_speed_ms : 0)
    })
  }
}