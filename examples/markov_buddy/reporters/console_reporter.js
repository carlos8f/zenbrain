module.exports = function container (get, set, clear) {
  return function console_reporter (tick, cb) {
    var rs = get('run_state')
    if (tick.size === '10s') {
      get('logger').info('id=', tick.id, 'num_messages=', tick.messages.length, {feed: 'public'})
    }
    cb()
  }
}