var tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var app_name = get('app_name')
  var apply_funcs = get('utils.apply_funcs')
  var passive_update = get('utils.passive_update')
  var tick_to_ticks = get('tick_to_ticks')
  return function bucket_to_tick (bucket) {
    //get('logger').info('bucket_to_tick', bucket.id)
    passive_update('ticks', bucket.id, function (tick, done2) {
      //console.error('bucket to tick passive updater', bucket.id)
      if (!tick) {
        tick = {
          app: app_name,
          id: bucket.id,
          time: bucket.time,
          size: bucket.size,
          data: {}
        }
        //get('logger').info('bucket to tick', 'create', tick.id)
      }
      else {
        //get('logger').info('bucket to tick', 'update', tick.id)
      }
      var g = {
        bucket: bucket,
        tick: tick
      }
      apply_funcs(g, get('bucket_reducers'), function (err) {
        if (err) return done(err)
        tick_to_ticks(g.tick)
        done2(null, g.tick)
      })
    })
  }
}