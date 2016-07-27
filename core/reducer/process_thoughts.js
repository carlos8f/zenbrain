var parallel = require('run-parallel-limit')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('core.constants')
  var merge_tick = get('reducer.merge_tick')
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
          //console.error('merge tick', tick.id)
          merge_tick(t, done)
        })
      })
    })
    parallel(tasks, c.parallel_limit, function (err) {
      if (err) return cb(err)
      // set processed flag for each thought
      var sub_tasks = []
      thoughts.forEach(function (thought) {
        sub_tasks.push(function (done) {
          thought.processed = true
          //console.error('save thought', thought.id)
          try {
            get('thoughts').save(thought, function (err) {
              if (err) {
                //console.error('save err')
                throw err
              }
              setImmediate(done)
            })
          }
          catch (e) {
            //console.error('CAUGHT')
            //console.error(thought)
            //console.error(JSON.stringify(thought, null, 2))
            return setImmediate(done)
          }
        })
      })
      parallel(sub_tasks, c.parallel_limit, function (err) {
        if (err) return cb(err)
        //console.error('done with')
        setImmediate(cb)
      })
    })
  }
}