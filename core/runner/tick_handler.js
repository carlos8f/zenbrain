var tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var get_id = get('utils.get_id')
  var apply_funcs = get('utils.apply_funcs')
  return function tick_handler (tick, rs, cb) {
    rs.queue || (rs.queue = [])
    function trigger (action) {
      action.id = get_id()
      if (!action.time) {
        action.time = tb(tick.time).resize(tick.size).add(1).toMilliseconds()
      }
      rs.queue.push(action)
    }
    apply_funcs(tick, trigger, c.logic, function (err) {
      if (err) return cb(err)
      var tasks = rs.queue.map(function (action) {
        return function (done) {
          apply_funcs(tick, action, rs, get('action_handlers'), done)
        })
      })
      apply_funcs(tasks, function (err)  {
        if (err) return cb(err)
        rs.queue = []
        cb()
      })
    })
  }
}