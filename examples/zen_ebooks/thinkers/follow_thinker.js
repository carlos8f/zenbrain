module.exports = function container (get, set, clear) {
  return function thinker (tick, cb) {
    var rs = get('run_state')
    if (!rs.follow_queue) {
      rs.follow_queue = []
    }
    ;(tick.follows || []).forEach(function (follow) {
      rs.follow_queue.push({
        id_str: follow.id_str
      })
    })
    cb()
  }
}