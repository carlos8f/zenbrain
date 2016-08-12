var colors = require('colors')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var str_to_color = get('utils.str_to_color')
  var get_tick_str = get('utils.get_tick_str')
  var map = get('map')
  return function action_handler (tick, action, rs, cb) {
    get('logger').info('action', get_tick_str(tick.id), action.type.grey)
    if (tick.size === '20s' && action.type === 'console_log') {
      // mapping to color
      var color = str_to_color(action.text)
      // actually do the logging
      get('logger').info('message', action.text[color], {feed: 'messages'})
      // record the color selected to a new data key
      assert(color)
      map('color', color)
    }
    cb()
  }
}