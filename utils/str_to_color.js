var crypto = require('crypto')

module.exports = function str_to_color (str) {
  var slug_colors = [
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white'
  ]
  var hash_val = crypto.createHash('sha1').update(str).digest().readInt8() + 128
  var color_idx = Math.floor((hash_val / 255) * slug_colors.length)
  return slug_colors[color_idx]
}