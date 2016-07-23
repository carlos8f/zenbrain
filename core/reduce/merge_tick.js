var tb = require('timebucket')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var apply_funcs = get('utils.apply_funcs')
  return function merge_tick (t, cb) {
    if (!t.tick) {
      // init tick
      var bucket = tb(t.thoughts[0].time).resize(t.size)
      t.tick = {
        id: bucket.toString(),
        time: bucket.toMilliseconds(),
        size: t.size,
        complete: false,
        seen: false,
        thoughts: 0,
        thought_ids: [],
        min_time: null,
        max_time: null
      }
    }
    var new_thoughts = false
    var tick = t.tick, thoughts = t.thoughts, size = t.size
    // reduce thoughts to tick
    thoughts.forEach(function (thought) {
      if (tick.thought_ids.indexOf(thought.id) !== -1) return
      new_thoughts = true
      assert(tb(thought.time).resize(size).toString() === tick.id)
      tick.thought_ids.push(thought.id)
      tick.thoughts++
      tick.min_time = tick.min_time ? Math.min(tick.min_time, thought.time) : thought.time
      tick.max_time = tick.max_time ? Math.max(tick.max_time, thought.time) : thought.time
    })
    if (!new_thoughts) {
      return cb()
    }
    // apply reducers to this tick
    apply_funcs(t, get('reducers'), function (err) {
      if (err) return cb(err)
      get('ticks').save(tick, cb)
    })
  }
}