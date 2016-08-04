var tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var series = get('motley:vendor.run-series')
  var mark_complete = get('utils.mark_complete')
  var get_timestamp = get('utils.get_timestamp')
  return function run () {
    var rs = get('run_state')
    var runner = get('runner')
    var max_time = new Date().getTime()
    var currently_idle = false
    ;(function getNext () {
      rs.tick = tb(c.brain_speed).toString()
      mark_complete(max_time, c.brain_speed, function (err) {
        if (err) throw err
        //get('logger').info('run', 'tick'.grey, rs.tick.grey)
        var params = {
          query: {
            app_name: get('app_name'),
            status: 'complete',
            size: c.brain_speed,
            time: {
              $gt: max_time
            }
          },
          sort: {
            time: 1
          }
        }
        //console.error('params', get_timestamp(max_time), params, {feed: 'runner'})
        get('ticks').select(params, function (err, ticks) {
          if (err) throw err
          if (ticks.length) {
            //get('logger').info('run', 'processing'.grey, ticks.length, 'ticks'.grey)
            currently_idle = false
            var tasks = ticks.map(function (tick) {
              max_time = Math.max(tick.time, max_time)
              return function task (done) {
                runner(tick, done)
              }
            })
            series(tasks, function (err) {
              if (err) {
                get('logger').error('run err', err)
              }
              if (rs.tick !== rs.last_tick) {
                rs.last_tick = rs.tick
              }
              setImmediate(getNext)
            })
          }
          else {
            if (!currently_idle) {
              //get('logger').info('run', 'idle'.grey)
              currently_idle = true
            }
            if (rs.tick !== rs.last_tick) {
              rs.last_tick = rs.tick
            }
            setTimeout(getNext, c.brain_speed_ms)
          }
        })
      })
    })()
  }
}