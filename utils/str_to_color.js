var crypto = require('crypto')
  , assert = require('assert')

module.exports = function str_to_color (str) {
  var slug_colors = [
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white'
  ]
  var ret
  try {
    var hash_val = crypto.createHash('sha1').update(str).digest().readInt8() + 128
    var color_idx = Math.floor((hash_val / 256) * slug_colors.length)
    assert(color_idx > -1)
    assert(color_idx < slug_colors.length)
    ret = slug_colors[color_idx]
    assert(typeof ret === 'string')
  }
  catch (e) {
    return 'grey'
  }
  return ret
}