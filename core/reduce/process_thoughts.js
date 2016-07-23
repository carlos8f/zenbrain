var parallel = require('run-parallel')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('core.constants')
  var merge_tick = get('merge_tick')
  var get_timestamp = get('utils.get_timestamp')
  return function process_thoughts (thoughts, cb) {
    // break thoughts into timebuckets at each size
    var ticks = {}
    var tasks = []
    thoughts.forEach(function (thought) {
      c.tick_sizes.forEach(function (size) {
        var tickId = tb(thought.time)
          .resize(size)
          .toString()
        ticks[tickId] || (ticks[tickId] = {thoughts: [], size: size})
        ticks[tickId].thoughts.push(thought)
      })
    })
    Object.keys(ticks).forEach(function (tickId) {
      var t = ticks[tickId]
      // for each bucket, load existing tick
      tasks.push(function (done) {
        get('motley:db.ticks').load(tickId, function (err, tick) {
          if (err) return done(err)
          t.tick = tick
          // upsert this tick
          merge_tick(t, done)
        })
      })
    })
    parallel(tasks, function (err) {
      if (err) return cb(err)
      // set processed flag for each thought
      tasks = []
      thoughts.forEach(function (thought) {
        tasks.push(function (done) {
          thought.processed = true
          get('thoughts').save(thought, done)
        })
      })
      parallel(tasks, cb)
    })
  }
}