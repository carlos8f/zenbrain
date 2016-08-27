var tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var app_name = get('app_name')
  return function tick_defaults (tick_id, size) {
    if (tick_id.indexOf(app_name) === -1) {
      tick_id = app_name + ':' + tick_id
    }
    try {
      return {
        app: app_name,
        id: tick_id,
        time: tb(tick_id.split(':')[1]).toMilliseconds(),
        size: size,
        thought_ids: [],
        data: {},
        processed: false
      }
    }
    catch (e) {
      console.error(tick_id)
    }
  }
}