var parallel = require('run-parallel-limit')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var merge_thoughts = get('merge_thoughts')
  var get_timestamp = get('utils.get_timestamp')
  return function process_thoughts (thoughts, cb) {
    // break thoughts into timebuckets at each size
    var ticks = {}
    var tasks = []
    thoughts.forEach(function (thought) {
      var tickId = tb(thought.time)
        .resize(c.brain_speed)
        .toString()
      ticks[tickId] || (ticks[tickId] = {thoughts: [], size: c.brain_speed})
      ticks[tickId].thoughts.push(thought)
    })
    Object.keys(ticks).forEach(function (tickId) {
      var t = ticks[tickId]
      // for each bucket, load existing tick
      tasks.push(function (done) {
        var before = new Date().getTime()
        get('ticks').load(get('app_name') + ':' + tickId, function (err, tick) {
          if (err) return done(err)
          t.tick = tick
          get('logger').info('after tick load', new Date().getTime() - before, 'ms')
          // upsert this tick
          console.error('merge tick', tickId)
          var before = new Date().getTime()
          merge_thoughts(t, function (err) {
            if (err) return done(err)
            get('logger').info('after merge_tick', new Date().getTime() - before, 'ms')
            done()
          })
        })
      })
    })
    var before = new Date().getTime()
    parallel(tasks, c.parallel_limit, function (err) {
      //get('logger').info('process thoughts', new Date().getTime() - before, 'ms', 'for', tasks.length, 'tasks')
      if (err) return cb(err)
      // set processed flag for each thought
      var ids = thoughts.map(function (thought) {
        return thought.id
      })
      get('db').collection('thoughts').update({
        _id: {$in: ids}
      },
      {
        $set: {
          status: 'processed'
        }
      }, {
        multi: true
      },
      function (err, result) {
        if (err) return cb(err)
        //console.error('process thoughts result', result.result)
        //get('logger').info('after saves', new Date().getTime() - before, 'ms', result, thoughts.length, 'thoughts', {feed: 'reducer'})
        cb()
      })
    })
  }
}