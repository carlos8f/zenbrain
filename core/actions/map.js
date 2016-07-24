var colors = require('colors')

module.exports = function container (get, set, clear) {
  var mapper = get('mapper')
  return function map () {
    mapper()
  }
}