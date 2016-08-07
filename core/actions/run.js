var tb = require('timebucket')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var series = get('motley:vendor.run-series')
  var get_timestamp = get('utils.get_timestamp')
  var ids_processed = []
  return function run () {
    if (get('args').length) {
      throw new Error('unknown arg')
    }
    var rs = get('run_state')
    var runner = get('runner')
    ;[c.bucket_size].concat(c.reducer_sizes).forEach(function (size) {
      rs[size] || (rs[size] = {})
      if (rs[size].max_time) {
        getNext()
      }
      else {
        function findStart () {
          var params = {
            query: {
              app: get('app_name'),
              size: size,
              time: {
                $gt: new Date().getTime() - c.run_lookback
              }
            },
            sort: {
              time: 1
            },
            limit: 1
          }
          get('ticks').select(params, function (err, ticks) {
            if (err) throw err
            if (ticks.length) {
              rs[size].max_time = ticks[0].time - 1
              getNext()
            }
            else {
              setTimeout(findStart, 1000)
            }
          })
        }
        findStart()
      }

      function getNext () {
        //mark_complete(max_time, size, function (err) {
        //  if (err) throw err
        //get('logger').info('run', 'tick'.grey, size.grey)
        var params = {
          query: {
            app: get('app_name'),
            size: size,
            time: {
              $gt: rs[size].max_time, // search newer periods
              $lt: tb().resize(size).toMilliseconds() // not current period
            }
          },
          sort: {
            time: 1
          },
          limit: c.run_limit
        }
        //console.error('params', get_timestamp(rs[size].max_time), params, {feed: 'runner'})
        get('ticks').select(params, function (err, ticks) {
          if (err) throw err
          if (ticks.length) {
            //console.error('processing', ticks.length, 'ticks')
            var tasks = ticks.map(function (tick) {
              rs[size].max_time = Math.max(tick.time, rs[size].max_time)
              return function task (done) {
                if (ids_processed.indexOf(tick.id) !== -1) {
                  get('logger').error('run', 'warning: tick dupe', tick.id.grey)
                  return setImmediate(done)
                }
                runner(tick, function (err) {
                  if (err) return done(err)
                  ids_processed.push(tick.id)
                  setImmediate(done)
                })
              }
            })
            series(tasks, function (err) {
              if (err) {
                get('logger').error('run err', err)
              }
              //console.error('processed', ticks.length, 'ticks')
              setImmediate(getNext)
            })
          }
          else {
            setTimeout(getNext, c.brain_speed_ms)
          }
        })
      }
    })
  }
}