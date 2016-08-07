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
      var new_thoughts = 0
      var defaults = {
        app: app_name,
        id: app_name + ':' + tick_id,
        time: tb(tick_id).toMilliseconds(),
        size: c.bucket_size,
        prev_size: null,
        thought_ids: [],
        data: {}
      }
      function updater (tick, done) {
        tick.queue || (tick.queue = [])
        g.thoughts.forEach(function (thought) {
          if (tick.thought_ids.indexOf(thought.id) !== -1) {
            return
          }
          tick.queue.push(thought)
          new_thoughts++
        })
        done(null, tick)
      }
      passive_update(tick_id, defaults, updater, function (err, tick) {
        if (err) throw err
        if (new_thoughts) {
          tick_to_ticks(tick)
        }
      })
    })
  }
}