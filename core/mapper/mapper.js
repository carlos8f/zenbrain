var parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  return function mapper () {
    var c = get('config')
    if (get('args').length) {
      throw new Error('unknown arg')
    }
    parallel(get('mappers'), function (err) {
      if (err) throw err
    })
  }
}