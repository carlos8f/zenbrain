var parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var c = get('config')
  return function mapper () {
    if (get('args').length) {
      throw new Error('unknown arg')
    }
    parallel(get('mappers'), function (err) {
      if (err) throw err
    })
  }
}