var tb = require('timebucket')
var parallel = require('run-parallel-limit')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var get_timestamp = get('utils.get_timestamp')
  return function (time, size, cb) {
    var num_completed = 0, ids = []
    var to_time = tb().resize(size).subtract(2).toMilliseconds()
    get('ticks').select(
    {
      query: {
        app_name: get('app_name'),
        status: 'processed',
        time: {
          $gt: time,
          $lt: to_time
        },
        size: size
      },
      limit: c.mark_complete_limit
    }, function (err, results) {
      if (err) return cb(err)
      //get('logger').info('mark_complete', 'results', results.length)
      var tasks = results.map(function (tick) {
        return function (done) {
          var bucket = tb(tick.time).resize(tick.size)
          var next_bucket = tb(bucket.toString()).add(1)
          if (next_bucket.toMilliseconds() > new Date().getTime()) {
            return done()
          }
          get('db').collection('thoughts').count({
            app_name: get('app_name'),
            status: 'unprocessed',
            time: {
              $lt: next_bucket.toMilliseconds(),
              $gte: bucket.toMilliseconds()
            }
          }, function (err, num_unprocessed) {
            if (err) return cb(err)
            if (!num_unprocessed) {
              ids.push(tick.id)
              num_completed++
              //get('logger').info('mark_complete', 'completed'.grey, tick.id.cyan, get_timestamp(tick.time))
              done()
            }
            else {
              //get('logger').info('mark_complete', 'still processing'.grey, tick.id, num_unprocessed)
              done()
            }
          })
        }
      })
      parallel(tasks, c.parallel_limit, function (err) {
        if (err) return cb(err)
        if (num_completed) {
          get('db').collection('ticks').update({
            _id: {$in: ids}
          },
          {
            $set: {
              status: 'complete'
            }
          }, {
            multi: true
          },
          function (err, result) {
            if (err) return cb(err)
            //console.error('mark complete result', result.result)
            //get('logger').info('mark_complete', 'completed', num_completed, 'ticks.')
            cb()
          })
        }
        else {
          cb()
        }
      })
    })
  }
}