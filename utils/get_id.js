var crypto = require('crypto')

module.exports = function container (get, set, clear) {
  return function get_id () {
    var c = get('config')
    return crypto.randomBytes(c.id_bytes).toString('hex')
  }
}