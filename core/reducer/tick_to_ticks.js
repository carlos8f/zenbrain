var tb = require('timebucket')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var app_name = get('app_name')
  var apply_funcs = get('utils.apply_funcs')
  var passive_update = get('utils.passive_update')
  return function tick_to_ticks (sub_tick) {
    //get('logger').info('tick_to_ticks', sub_tick.id)
    c.reducer_sizes.forEach(function (size) {
      var tick_bucket = tb(sub_tick.time).resize(size)
      var tick_id = app_name + ':' + tick_bucket.toString()
      passive_update('ticks', tick_id, function (tick, done2) {
        if (!tick) {
          tick = {
            app: app_name,
            id: tick_id,
            time: tick_bucket.toMilliseconds(),
            size: size,
            data: {}
          }
          //get('logger').info('tick to tick', 'create', tick.id)
        }
        else {
          //get('logger').info('tick to tick', 'update', tick.id)
        }
        var g = {
          tick: tick,
          sub_ticks: [sub_tick]
        }
        apply_funcs(g, get('tick_reducers'), function (err, g) {
          if (err) return done2(err)
          //get('logger').info('tick_to_ticks', sub_tick.id, '->', tick.id)
          done2(null, g.tick)
        })
      })
    })
  }
}