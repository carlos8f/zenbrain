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
      var defaults = {
        app: app_name,
        id: tick_id,
        time: tick_bucket.toMilliseconds(),
        size: size,
        data: {}
      }
      //get('logger').info('tick_to_ticks', sub_tick.id, '->', next_size, 'passive update start')
      passive_update('ticks', tick_id, defaults, function (tick, done) {
        var g = {
          tick: tick,
          sub_tick: sub_tick
        }
        apply_funcs(g, get('tick_reducers'), function (err, g) {
          if (err) return done(err)
          done(null, g.tick)
        })
      })
    })
  }
}