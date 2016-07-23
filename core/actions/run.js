module.exports = function container (get, set, clear) {
  var c = get('core.constants')
  var series = get('motley:vendor.run-series')
  return function run (options) {
    var rs = get('run_state')
    var brain = get('brain')
    rs.max_times = {}
    var start_time = new Date().getTime()
    c.tick_sizes.forEach(function (tick_size) {
      rs.max_times[tick_size] = start_time
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
                rs.max_times[tick_size] = Math.max(tick.min_time, rs.max_times[tick_size])
                //get('logger').info('run', 'see', tick.id)
                brain.handle_tick(tick, function (err) {
                  if (err) return done(err)
                  get('ticks').save(tick, done)
                })
              }
            })
            brain.report(function (err, report) {
              if (err) {
                get('logger').error('think err', err)
              }
              setTimeout(getNext, c.tick)
            })
          }
          else {
            setTimeout(getNext, c.nhn)
          }
        })
      })()
    })
  }
}