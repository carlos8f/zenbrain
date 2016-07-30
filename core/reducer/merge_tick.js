var tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var apply_funcs = get('utils.apply_funcs')
  return function merge_tick (t, cb) {
    if (!t.tick) {
      // init tick
      var bucket = tb(t.thoughts[0].time).resize(t.size)
      t.tick = {
        id: get('app_name') + '_' + bucket.toString(),
        time: bucket.toMilliseconds(),
        size: t.size,
        complete: false,
        seen: false,
        num_thoughts: 0,
        thought_ids: [],
        min_time: null,
        max_time: null
      }
    }
    var tick = t.tick, thoughts = t.thoughts, size = t.size
    // reduce thoughts to tick
    thoughts = thoughts.filter(function (thought) {
      return tick.thought_ids.indexOf(thought.id) === -1
    })
    if (!thoughts.length) {
      //console.error('no new thoughts', t.tick.id)
      return cb()
    }
    //console.error('reducing', t.tick.id)
    thoughts.forEach(function (thought) {
      tick.thought_ids.push(thought.id)
      tick.num_thoughts++
      tick.min_time = tick.min_time ? Math.min(tick.min_time, thought.time) : thought.time
      tick.max_time = tick.max_time ? Math.max(tick.max_time, thought.time) : thought.time
    })
    t.thoughts = thoughts
    // apply reducers to this tick
    apply_funcs(t, get('reducers'), function (err) {
      if (err) return cb(err)
      get('ticks').save(tick, cb)
    })
  }
}