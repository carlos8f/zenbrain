var tb = require('timebucket')
  , assert = require('assert')
  , colors = require('colors')

module.exports = function container (get, set, clear) {
  var series = get('motley:vendor.run-series')
  var get_timestamp = get('utils.get_timestamp')
  var get_tick_str = get('utils.get_tick_str')
  return function run () {
    var c = get('config')
    var options = get('options')
    if (get('args').length) {
      throw new Error('unknown arg')
    }
    var rs = get('run_state')
    var runner = get('runner')
    var start = new Date().getTime()
    //get('logger').info('runner', 'starting'.grey)
    ;c.reducer_sizes.forEach(function (size) {
      rs[size] || (rs[size] = {})
      rs[size].max_time = start
      var waiting = false
      ;(function getNext () {
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
        get('ticks').select(params, function (err, ticks) {
          if (err) throw err
          if (ticks.length) {
            var tasks = ticks.map(function (tick) {
              rs[size].max_time = Math.max(tick.time, rs[size].max_time)
              return function task (done) {
                if (get('command') === 'run' && options.verbose) {
                  //get('logger').info('runner', get_tick_str(tick.id), 'running'.grey, {feed: 'trader'})
                }
                runner(tick, rs, function (err) {
                  if (err) return done(err)
                  setImmediate(done)
                })
              }
            })
            series(tasks, function (err) {
              if (err) {
                get('logger').error('run err', err)
              }
              waiting = false
              setImmediate(getNext)
            })
          }
          else {
            if (!waiting && options.verbose) {
              //get('logger').info('runner', ('waiting for next ' + size + ' tick...').grey, {feed: 'trader'})
            }
            waiting = true
            setTimeout(getNext, c.brain_speed_ms)
          }
        })
      })()
    })
  }
}