var crypto = require('crypto')
  , colors = require('colors')

module.exports = function container (get, set) {
  var get_timestamp = get('utils.get_timestamp')
  var get_id = get('utils.get_id')
  var max_slug_length = 12
  var z = get('utils.zero_fill')
  return {
    _log: function (args) {
      var options = {}
      if (toString.call(args[args.length - 1]) === '[object Object]') {
        options = args.pop()
      }
      var time = new Date().getTime()
      args.unshift(get_timestamp(time).grey)
      var line = args.map(function (arg) {
        if (typeof arg !== 'string') {
          return JSON.stringify(arg, null, 2)
        }
        return arg
      }).join(' ')
      console.error(line)
      var log = {
        id: get_id(),
        time: time,
        line: line,
        data: options.data || null,
        public: options.public || false
      }
      try {
        get('logs').save(log, function (err, saved) {
          // nothing
        })
      }
      catch (e) {}
    },
    info: function () {
      var args = [].slice.call(arguments)
      var slug = args.shift()
      max_slug_length = Math.max(colors.strip(slug).length, max_slug_length)
      var slug_colors = [
        'yellow',
        'blue',
        'magenta',
        'cyan',
        'white'
      ]
      var hash_val = crypto.createHash('sha1').update(slug).digest().readInt8() + 128
      var color_idx = Math.floor((hash_val / 255) * slug_colors.length)
      //console.error('color idx', hash_val, color_idx, slug_colors[color_idx])
      if (typeof slug_colors[color_idx] === 'string') {
        slug = ('[' + z(max_slug_length, slug, ' ') + ']')[slug_colors[color_idx]]
      }
      args.unshift(slug)
      this._log(args)
    },
    error: function () {
      var args = [].slice.call(arguments)
      var msg = '[ERROR]'.red
      args.unshift(msg)
      this._log(args)
    }
  }
}
