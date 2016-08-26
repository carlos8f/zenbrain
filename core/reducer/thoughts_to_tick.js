var parallel = require('run-parallel')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var app_name = get('app_name')
  var apply_funcs = get('utils.apply_funcs')
  var tick_to_ticks = get('tick_to_ticks')
  var passive_update = get('utils.passive_update')
  var get_timestamp = get('utils.get_timestamp')
  var tick_defaults = get('tick_defaults')
  return function thoughts_to_tick (thoughts) {
    var c = get('config')
    //get('logger').info('thoughts_to_tick', thoughts.length, get_timestamp(thoughts[0].time))
    var groups = {}
    thoughts.forEach(function (thought) {
      var tick_id = tb(thought.time)
        .resize(c.reducer_sizes[0])
        .toString()
      groups[tick_id] || (groups[tick_id] = {thoughts: []})
      groups[tick_id].thoughts.push(thought)
    })
    Object.keys(groups).forEach(function (tick_id) {
      var g = groups[tick_id]
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
        g.tick = tick
        apply_funcs(g, get('thought_reducers'), function (err, g) {
          if (err) return done(err)
          g = {
            tick: tick_defaults(tick_id, c.reducer_sizes[0]),
            sub_tick: g.tick
          }
          apply_funcs(g, get('tick_reducers'), function (err, g) {
            if (err) return done(err)
            tick_to_ticks(g.tick)
            done(null, g.tick)
          })
        })
      }
      passive_update('ticks', tick_id, tick_defaults(), updater)
    })
  }
}