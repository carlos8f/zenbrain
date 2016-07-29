var crypto = require('crypto')

module.exports = function container (get, set, clear) {
  var c = get('config')
  return function get_id () {
    return crypto.randomBytes(c.id_bytes).toString('hex')
  }
}