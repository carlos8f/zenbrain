var parallel = require('run-parallel')
  , tb = require('timebucket')
  , assert = require('assert')

module.exports = function container (get, set, clear) {
  var app_name = get('app_name')
  var apply_funcs = get('utils.apply_funcs')
  var tick_to_ticks = get('tick_to_ticks')
  var passive_update = get('utils.passive_update')
  var get_timestamp = get('utils.get_timestamp')
  var get_tick_str = get('utils.get_tick_str')
  var tick_defaults = get('tick_defaults')
  return function thoughts_to_tick (thoughts) {
    var c = get('config')
    //get('logger').info('thoughts', thoughts.length, get_timestamp(thoughts[0].time).grey)
    var groups = {}
    thoughts.forEach(function (thought) {
      var tick_id = get('app_name') + ':' + tb(thought.time)
        .resize(c.reducer_sizes[0])
        .toString()
      if (!groups[tick_id]) {
        groups[tick_id] = {thoughts: []}
        //get('logger').info('thoughts->tick', tick_id, get_tick_str(tb(tick_id.split(':')[1]).resize('1h').toString()))
      }
      groups[tick_id].thoughts.push(thought)
    })
    Object.keys(groups).forEach(function (tick_id) {
      var g = groups[tick_id]
      function updater (tick, done) {
        assert.equal(tick.id, tick_id)
        //\get('logger').info('thoughts->tick2', get_tick_str(tb(tick.id.split(':')[1]).resize('1h').toString()))
        g.thoughts.forEach(function (thought, idx) {
          if (tick.thought_ids.indexOf(thought.id) !== -1) {
            g.thoughts.splice(idx, 1)
            return
          }
        })
        if (!g.thoughts.length) {
          //get('logger').info('thoughts->tick2', get_tick_str(tb(tick.id.split(':')[1]).resize('1h').toString()), 'NO NEW THOUGHTS')
          return
        }
        g.tick = tick
        apply_funcs(g, get('thought_reducers'), function (err, g) {
          if (err) return done(err)
          g.tick.processed = false
          //get('logger').info('thoughts->tick3', get_tick_str(tb(g.tick.id.split(':')[1]).resize('1h').toString()))
          assert.equal(g.tick.id, tick.id)
          assert.equal(g.tick.id, tick_id)
          tick_to_ticks(g.tick)
          done(null, g.tick)
        })
      }
      //get('logger').info('thoughts->tick', get_tick_str(tb(tick_id).resize('1h').toString()))
      passive_update('ticks', tick_id, tick_defaults(tick_id, c.reducer_sizes[0]), updater)
    })
  }
}