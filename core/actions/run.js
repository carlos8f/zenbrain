module.exports = function container (get, set, clear) {
  var c = get('core.constants')
  var series = get('motley:vendor.run-series')
  return function run () {
    var rs = get('run_state')
    var runner = get('runner')
    var start_time = new Date().getTime()
    c.tick_sizes.forEach(function (tick_size) {
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
            var tasks = ticks.map(function (tick) {
              return function task (done) {
                //get('logger').info('run', 'see', tick.id)
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
            setTimeout(getNext, c.brain_speed_ms / 2)
          }
        })
      })()
    })
  }
}