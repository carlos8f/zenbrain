var tb = require('timebucket')
  , parallel = require('run-parallel')
  , n = require('numbro')

module.exports = function container (get, set, clear) {
  var app_name = get('app_name')
  var apply_funcs = get('utils.apply_funcs')
  var passive_update = get('utils.passive_update')
  var counter = 0
  var per_sec = 0
  var first_run = true
  var tick_defaults = get('tick_defaults')
  return function tick_to_ticks (sub_tick) {
    var c = get('config')
    if (first_run) {
      function reducer_perf_report () {
        per_sec = n(counter).divide(30).format('0')
        get('db').collection('thoughts').count({app: get('app_name')}, function (err, thought_count) {
          if (err) throw err
          if (n(counter).divide(30).value() >= c.reducer_perf_report_min || thought_count) {
            get('logger').info('reducer', 'processing  '.grey + per_sec + '/ticks sec, thought queue: '.grey + thought_count, {feed: 'reducer'})
          }
          counter = 0
          setTimeout(reducer_perf_report, c.reducer_perf_report_timeout)
        })
      }
      setTimeout(reducer_perf_report, c.reducer_perf_report_timeout)
      first_run = false
    }
    //get('logger').info('tick_to_ticks', sub_tick.id)
    counter++
    c.reducer_sizes.slice(1).forEach(function (size) {
      var tick_bucket = tb(sub_tick.time).resize(size)
      var tick_id = app_name + ':' + tick_bucket.toString()
      //get('logger').info('tick_to_ticks', sub_tick.id, '->', next_size, 'passive update start')
      passive_update('ticks', tick_id, tick_defaults(tick_id, size), function (tick, done) {
        var g = {
          tick: tick,
          sub_tick: sub_tick
        }
        tick.processed = false
        apply_funcs(g, get('tick_reducers'), function (err, g) {
          if (err) return done(err)
          g.tick.processed = false
          done(null, g.tick)
        })
      }, function (err) {
        if (err) throw err
        counter++
      })
    })
  }
}