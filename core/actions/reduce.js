var colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('config')
  return function reduce () {
    get('reducers').forEach(function (reducer) {
      ;(function reduce () {
        reducer(function (err, idle) {
          if (err) {
            get('logger').error('reduce err', err, {feed: 'errors'})
          }
          setTimeout(function () {
            reduce()
          }, idle ? c.reduce_timeout : 0)
        })
      })()
    })
  }
}