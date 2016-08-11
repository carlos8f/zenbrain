var colors = require('colors')

module.exports = function container (get, set, clear) {
  var str_to_color = get('utils.str_to_color')
  return function action_handler (tick, action, rs, cb) {
    if (action.type === 'console_log') {
      // mapping to color
      var color = str_to_color(action.text)
      // actually do the logging
      get('logger').info('message', action.text[color], {feed: 'messages'})
      // record the color selected to a new data key
      tick.data.colors || (tick.data.colors = [])
      tick.data.colors.push(color)
    }
    cb()
  }
}