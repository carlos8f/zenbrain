module.exports = function container (get, set, clear) {
  var get_tick_str = get('utils.get_tick_str')
  return function action_handler (tick, action, rs, cb) {
    get('logger').info('action_handler', get_tick_str(tick.id))
    if (action.type === 'console_log') {
      // actually do the logging
      get('logger').info('message', action.text)
    }
    cb()
  }
}