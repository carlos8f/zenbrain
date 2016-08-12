var tb = require('timebucket')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var series = get('motley:vendor.run-series')
  var get_timestamp = get('utils.get_timestamp')
  var get_id = get('utils.get_id')
  var get_duration = get('utils.get_duration')
  set('@silent', true)
  return function sim () {
    if (get('args').length) {
      throw new Error('unknown arg')
    }
    var rs = get('run_state')
    var runner = get('runner')
    var start = new Date().getTime()
    var latch = c.reducer_sizes.length
    var result = {}
    ;c.reducer_sizes.forEach(function (size) {
      var s = JSON.parse(JSON.stringify(rs))
      result[size] = s
      s.size = size
      s.time = new Date().getTime()
      s.start_us = tb('µs').value
      ;(function getNext () {
        s.max_time = Math.max(s.max_time || 0, tb().resize('1d').subtract(c.sim_days).toMilliseconds())
        var params = {
          query: {
            app: get('app_name'),
            size: size,
            time: {
              $gt: s.max_time
            }
          },
          sort: {
            time: 1
          },
          limit: c.sim_limit
        }
        get('ticks').select(params, function (err, ticks) {
          if (err) throw err
          if (ticks.length) {
            var tasks = ticks.map(function (tick) {
              if (!s.start_time) {
                s.start_time = tick.time
              }
              s.end_time = tick.time
              s.max_time = Math.max(tick.time, s.max_time)
              return function task (done) {
                runner(tick, s, function (err) {
                  if (err) return done(err)
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
            s.end_us = tb('µs').value
            s.last_us = s.end_us - s.start_us
            s.last_duration = get_duration(s.last_us)
            s.total_us += s.last_us
            s.total_duration = get_duration(s.total_us)
            s.sim_time = s.end_time - s.start_time
            s.sim_duration = get_duration(s.sim_time * 1000)
            if (!--latch) {
              console.log(JSON.stringify(result, null, 2))
              get('app').close(function () {
                process.exit()
              })
            }
          }
        })
      })()
    })
  }
}