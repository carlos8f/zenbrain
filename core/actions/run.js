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
    ;[c.brain_speed].concat(c.reducer_sizes).forEach(function (size) {
      var max_time = 0
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
            max_time = ticks[0].time - 1
            getNext()
          }
          else {
            setTimeout(findStart, 1000)
          }
        })
      }
      findStart()

      function getNext () {
        //mark_complete(max_time, size, function (err) {
        //  if (err) throw err
          //get('logger').info('run', 'tick'.grey, rs.tick.grey)
        var params = {
          query: {
            app: get('app_name'),
            size: size,
            time: {
              $gt: max_time
            }
          },
          sort: {
            time: 1
          },
          limit: c.run_limit
        }
        if (max_time) {
          params.query.time = {
            $gt: max_time
          }
        }
        //console.error('params', get_timestamp(max_time), params, {feed: 'runner'})
        get('ticks').select(params, function (err, ticks) {
          if (err) throw err
          if (ticks.length) {
            var tasks = ticks.map(function (tick) {
              max_time = Math.max(tick.time, max_time)
              assert(max_time)
              assert(!Number.isNaN(max_time))
              //console.error(get_timestamp(max_time))
              return function task (done) {
                if (ids_processed.indexOf(tick.id) !== -1) {
                  get('logger').error('run', 'warning: tick dupe', tick.id.grey)
                  return setImmediate(done)
                }
                //console.error(get_timestamp(max_time))
                //get('logger').info('run', tick.id)
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