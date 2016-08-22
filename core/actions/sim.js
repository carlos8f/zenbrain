var tb = require('timebucket')
  , sig = require('sig')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var series = get('motley:vendor.run-series')
  var get_timestamp = get('utils.get_timestamp')
  var get_id = get('utils.get_id')
  var get_duration = get('utils.get_duration')
  return function sim () {
    var c = get('config')
    var options = get('options')
    if (!options.verbose) {
      set('@silent', true)
    }
    if (get('args').length) {
      throw new Error('unknown arg')
    }
    var runner = get('runner')
    var start = new Date().getTime()
    var s = {id: get_id()}
    s.ticks = 0
    s.tick_sigs = []
    s.start_us = tb('µs').value
    s.sim_end_bucket = tb(c.sim_input_unit)
    s.sim_end_time = s.sim_end_bucket.toMilliseconds()
    s.sim_end_tick = s.sim_end_bucket.toString()
    s.sim_end_timestamp = get_timestamp(s.sim_end_time)
    s.sim_start_bucket = tb(s.sim_end_tick).subtract(c.sim_input_limit)
    s.sim_start_time = s.sim_start_bucket.toMilliseconds()
    s.sim_start_tick = s.sim_start_bucket.toString()
    s.sim_start_timestamp = get_timestamp(s.sim_start_time)
    s.max_time = s.sim_start_time - 1
    ;(function getNext () {
      var params = {
        query: {
          app: get('app_name'),
          time: {
            $lt: s.sim_end_time,
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
            s.ticks++
            s.tick_sigs.push(sig(tick))
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
          assert(!Number.isNaN(s.end_us))
          assert(!Number.isNaN(s.start_us))
          s.last_us = s.end_us - s.start_us
          assert(!Number.isNaN(s.last_us))
          s.last_duration = get_duration(s.last_us)
          s.sim_time = s.end_time ? s.end_time - s.start_time : 0
          s.sim_duration = get_duration(s.sim_time * 1000)
          s.input_hash = sig(s.tick_sigs)
          delete s.tick_sigs
          delete s.start_us
          delete s.sim_end_bucket
          delete s.sim_end_time
          delete s.sim_end_tick
          delete s.start_bucket
          delete s.start_time
          delete s.start_tick
          delete s.max_time
          get('run_states').save(s, function (err, saved) {
            if (err) throw err
            set('sim_result', saved)
            console.log(JSON.stringify(saved, null, 2))
            get('app').close(function () {
              process.exit()
            })
          })
        }
      })
    })()
  }
}