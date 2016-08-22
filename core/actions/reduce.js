var colors = require('colors')

module.exports = function container (get, set, clear) {
  return function reduce () {
    var c = get('config')
    if (get('args').length) {
      throw new Error('unknown arg')
    }
    get('reducers').forEach(function (reducer) {
      ;(function reduce () {
        //console.error('reducer')
        reducer(function (err, idle) {
          //console.error('reducer finish', idle)
          if (err) {
            console.error(err)
            get('logger').error('reduce err', err, {feed: 'errors'})
            if (err.name === 'MongoError') {
              throw err
            }
          }
          setTimeout(function () {
            reduce()
          }, idle ? c.reduce_timeout : 0)
        })
      })()
    })
  }
}