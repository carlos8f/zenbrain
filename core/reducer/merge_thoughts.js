var tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var apply_funcs = get('utils.apply_funcs')
  return function merge_thoughts (t, cb) {
    var before = new Date().getTime()
    if (!t.tick) {
      // init tick
      var bucket = tb(t.thoughts[0].time).resize(t.size)
      t.tick = {
        id: get('app_name') + ':' + bucket.toString(),
        app_name: get('app_name'),
        time: bucket.toMilliseconds(),
        size: t.size,
        status: 'unprocessed',
        thought_ids: [],
      }
    }
    var tick = t.tick, thoughts = t.thoughts, size = t.size
    // reduce thoughts to tick
    var new_thoughts = 0
    thoughts.forEach(function (thought) {
      if (tick.thought_ids.indexOf(thought.id) !== -1) {
        return
      }
      new_thoughts++
      tick.thought_ids.push(thought.id)
    })
    if (!new_thoughts) {
      //console.error('no new thoughts', t.tick.id)
      return cb()
    }
    // apply reducers to this tick
    //get('logger').info('after thought filter', new Date().getTime() - before, 'ms')
    before = new Date().getTime()
    apply_funcs(t, get('thought_reducers'), function (err) {
      //get('logger').info('after reducers', new Date().getTime() - before, 'ms')
      if (err) return cb(err)
      if (tick.status === 'complete') {
        get('logger').info('reducer', 'warning'.red, 'save after complete'.grey, tick.id)
      }
      get('ticks').save(tick, function (err) {
        if (err) return cb(err)
        //get('logger').info('after save', new Date().getTime() - before, 'ms')
        cb()
      })
    })
  }
}