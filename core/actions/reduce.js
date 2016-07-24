var colors = require('colors')

module.exports = function container (get, set, clear) {
  var reducer = get('reducer')
  var c = get('core.constants')
  return function reduce () {
    reducer(function (err, idle) {
      if (err) {
        get('logger').error('reduce err', err, {feed: 'errors'})
      }
      if (idle) {
        get('logger').info('reduce', 'idle'.grey)
      }
      setTimeout(function () {
        reduce()
      }, idle ? c.brain_speed_ms : 0)
    })
  }
}