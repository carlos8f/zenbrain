var tb = require('timebucket')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var app_name = get('app_name')
  var apply_funcs = get('utils.apply_funcs')
  var passive_update = get('utils.passive_update')
  return function tick_to_ticks (sub_tick) {
    //get('logger').info('tick_to_ticks', sub_tick.id)
    var size_idx = c.reducer_sizes.indexOf(sub_tick.size)
    var next_size = c.reducer_sizes[size_idx + 1]
    if (!next_size) {
      return
    }
    var tick_bucket = tb(sub_tick.time).resize(next_size)
    var tick_id = app_name + ':' + tick_bucket.toString()
    var defaults = {
      app: app_name,
      id: tick_id,
      time: tick_bucket.toMilliseconds(),
      size: next_size,
      prev_size: sub_tick.size,
      data: {}
    }
    //get('logger').info('tick_to_ticks', sub_tick.id, '->', next_size, 'passive update start')
    passive_update(tick_id, defaults, null, function (err, tick) {
      if (err) throw err
      //get('logger').info('tick_to_ticks', sub_tick.id, '->', tick.id, 'done')
      tick_to_ticks(tick)
    })
  }
}