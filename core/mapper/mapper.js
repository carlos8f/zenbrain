var parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  return function mapper (options) {
    parallel(get('mappers'), function (err) {
      if (err) throw err
    })
  }
}