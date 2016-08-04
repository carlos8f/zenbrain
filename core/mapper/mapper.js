var parallel = require('run-parallel-limit')

module.exports = function container (get, set, clear) {
  var c = get('config')
  return function mapper (options) {
    if (typeof options === 'string') {
      throw new Error('unknown arg ' + options)
    }
    parallel(get('mappers'), c.parallel_limit, function (err) {
      if (err) throw err
    })
  }
}