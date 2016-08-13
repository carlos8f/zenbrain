var colors = require('colors')
  , ansi_up = require('ansi_up')

module.exports = function container (get, set) {
  var get_timestamp = get('utils.get_timestamp')
  var get_id = get('utils.get_id')
  var z = get('utils.zero_fill')
  var str_to_color = get('utils.str_to_color')
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
        app: get('app_name'),
        time: time,
        line: line,
        html: ansi_up.linkify(ansi_up.ansi_to_html(ansi_up.escape_for_html(line), {use_classes: true})).replace(/<\/span>"/g, '"'),
        data: options.data || null
      }
      try {
        get('logs').save(log, function (err, saved) {
          // nothing
        })
      }
      catch (e) {}
    },
    info: function () {
      if (get('silent')) return
      var args = [].slice.call(arguments)
      var slug = args.shift()
      var color = str_to_color(slug)
      slug = ('[' + z(12, slug, ' ') + ']')[color]
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
