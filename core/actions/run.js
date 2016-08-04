var tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var series = get('motley:vendor.run-series')
  var mark_complete = get('utils.mark_complete')
  var get_timestamp = get('utils.get_timestamp')
  return function run () {
    var rs = get('run_state')
    var runner = get('runner')
    ;[c.brain_speed].concat(c.reducer_sizes).forEach(function (size) {
      var max_time = new Date().getTime()
      ;(function getNext () {
        mark_complete(max_time, size, function (err) {
          if (err) throw err
          //get('logger').info('run', 'tick'.grey, rs.tick.grey)
          var params = {
            query: {
              app_name: get('app_name'),
              status: 'complete',
              size: size,
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
              if (rs.tick !== rs.last_tick) {
                rs.last_tick = rs.tick
              }
              setTimeout(getNext, c.brain_speed_ms)
            }
          })
        })
      })()
    })
  }
}