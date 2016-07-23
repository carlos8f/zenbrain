module.exports = function container (get, set, clear) {
  var c = get('core.constants')
  var process_thoughts = get('process_thoughts')
  return function reduce (cb) {
    get('thoughts').select({query: {processed: false}, limit: c.reducer_limit}, function (err, thoughts) {
      if (err) {
        if (get('app').closing) return
        throw err
      }
      var timeout
      if (!thoughts.length) {
        return cb(null, true)
      }
      else {
        process_thoughts(thoughts, function (err) {
          if (err) {
            if (get('app').closing) return
            throw err
          }
          idle = false
          log_trades('trade reducer', trades)
          timeout = setTimeout(reduce_trades, trades.length ? 0 : c.brain_speed_ms)
          set('timeouts[]', timeout)
        })
      }
    })
  }
}