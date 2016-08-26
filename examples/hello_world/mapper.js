var tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var map = get('map')
  var get_tick_str = get('utils.get_tick_str')
  return function mapper () {
    var c = get('config')
    var tick_id = tb().resize(c.reducer_sizes[0]).toString()
    get('logger').info('map', get_tick_str(get('app_name') + ':' + tick_id))
    map('message', {
      text: 'Hello world!'
    })
    setTimeout(mapper, Math.round(c.map_interval * Math.random()))
  }
}