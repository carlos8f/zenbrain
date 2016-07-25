module.exports = function container (get, set, clear) {
  var c = get('core.constants')
  var series = get('motley:vendor.run-series')
  var mark_complete = get('utils.mark_complete')
  return function run () {
    var rs = get('run_state')
    var runner = get('runner')
    var start_time = new Date().getTime()
    c.tick_sizes.forEach(function (tick_size) {
      var currently_idle = false
      ;(function getNext () {
        var params = {
          query: {
            complete: true,
            seen: false,
            size: tick_size,
            time: {
              $gte: start_time
            }
          },
          sort: {
            time: 1
          }
        }
        get('ticks').select(params, function (err, ticks) {
          if (err) throw err
          if (ticks.length) {
            currently_idle = false
            var tasks = ticks.map(function (tick) {
              return function task (done) {
                //get('logger').info('run', tick_size, tick.id)
                runner(tick, function (err) {
                  if (err) return done(err)
                  tick.seen = true
                  get('ticks').save(tick, done)
                })
              }
            })
            series(tasks, function (err) {
              if (err) {
                get('logger').error('run err', err)
              }
              setTimeout(getNext, c.brain_speed_ms / 2)
            })
          }
          else {
            mark_complete(new Date().getTime(), tick_size, function (err) {
              if (err) throw err
              if (!currently_idle) {
                get('logger').info('run', tick_size, 'idle'.grey)
                currently_idle = true
              }
              setTimeout(getNext, c.brain_speed_ms / 2)
            })
          }
        })
      })()
    })
  }
}