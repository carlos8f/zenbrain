var tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var app_name = get('app_name')
  function tick_defaults (tick_id, size) {
    return {
      app: app_name,
      id: app_name + ':' + tick_id,
      time: tb(tick_id).toMilliseconds(),
      size: size,
      thought_ids: [],
      data: {}
    }
  }
}