var tb = require('timebucket')

module.exports = function container (get, set, clear) {
  return function get_tick_str (tick_id) {
    var bucket = tb(tick_id.split(':')[1])
    var val = String(bucket.value)
    return bucket.size.spec.yellow + val.substring(0, val.length - 2).grey + val.substring(val.length - 2).cyan
  }
}