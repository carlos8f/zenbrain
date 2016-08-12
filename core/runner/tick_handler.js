var tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var get_id = get('utils.get_id')
  var apply_funcs = get('utils.apply_funcs')
  var get_timestamp = get('utils.get_timestamp')
  return function tick_handler (tick, rs, cb) {
    rs.queue || (rs.queue = [])
    rs.actions || (rs.actions = [])
    function trigger (action) {
      action.id = get_id()
      if (!action.time) {
        action.time = tb(tick.time).resize(tick.size).add(1).toMilliseconds()
      }
      action.timestamp = get_timestamp(action.time)
      rs.queue.push(action)
      rs.actions.push(action)
    }
    apply_funcs(tick, trigger, rs, c.logic.call(null, get, set, clear), function (err) {
      if (err) return cb(err)
      var tasks = rs.queue.map(function (action) {
        return function (done) {
          apply_funcs(tick, action, rs, get('action_handlers'), done)
        }
      })
      apply_funcs(tasks, function (err)  {
        if (err) return cb(err)
        rs.queue = []
        cb()
      })
    })
  }
}