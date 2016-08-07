var parallel = require('run-parallel')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var app_name = get('app_name')
  var apply_funcs = get('utils.apply_funcs')
  var tick_to_ticks = get('tick_to_ticks')
  var passive_update = get('utils.passive_update')
  var get_timestamp = get('utils.get_timestamp')
  return function thoughts_to_tick (thoughts) {
    //get('logger').info('thoughts_to_tick', thoughts.length, get_timestamp(thoughts[0].time))
    var groups = {}
    thoughts.forEach(function (thought) {
      var tick_id = tb(thought.time)
        .resize(c.bucket_size)
        .toString()
      groups[tick_id] || (groups[tick_id] = {thoughts: []})
      groups[tick_id].thoughts.push(thought)
    })
    Object.keys(groups).forEach(function (tick_id) {
      var g = groups[tick_id]
      var defaults = {
        app: app_name,
        id: app_name + ':' + tick_id,
        time: tb(tick_id).toMilliseconds(),
        size: c.bucket_size,
        thought_ids: [],
        queue: [],
        data: {}
      }
      function updater (tick, done) {
        g.thoughts.forEach(function (thought, idx) {
          if (tick.thought_ids.indexOf(thought.id) !== -1) {
            g.thoughts.splice(idx, 1)
            return
          }
        })
        if (!g.thoughts.length) {
          return
        }
        tick_to_ticks(tick)
        g.tick = tick
        apply_funcs(g, get('thought_reducers'), function (err, g) {
          if (err) return done(err)
          done(null, g.tick)
        })
      }
      passive_update('ticks', tick_id, defaults, updater)
    })
  }
}