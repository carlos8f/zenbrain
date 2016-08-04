var parallel = require('run-parallel-limit')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var merge_ticks = get('merge_ticks')
  var get_timestamp = get('utils.get_timestamp')
  return function process_ticks (ticks, cb) {
    // break thoughts into timebuckets at each size
    var buckets = {}
    var tasks = []
    ticks.forEach(function (tick) {
      c.reducer_sizes.forEach(function (size) {
        var bucketId = tb(tick.time)
          .resize(size)
          .toString()
        buckets[bucketId] || (buckets[bucketId] = {ticks: [], size: size})
        buckets[bucketId].ticks.push(tick)
      })
    })
    Object.keys(buckets).forEach(function (bucketId) {
      var b = buckets[bucketId]
      // for each bucket, load existing tick
      tasks.push(function (done) {
        var before = new Date().getTime()
        get('ticks').load(get('app_name') + ':' + bucketId, function (err, tick) {
          if (err) return done(err)
          b.tick = tick
          //get('logger').info('after tick load', new Date().getTime() - before, 'ms')
          // upsert this tick
          //console.error('merge tick', tick.id)
          //var before = new Date().getTime()
          merge_ticks(b, function (err) {
            if (err) return done(err)
            //get('logger').info('after merge_tick', new Date().getTime() - before, 'ms')
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
      var ids = ticks.map(function (tick) {
        return tick.id
      })
      get('db').collection('ticks').update({
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