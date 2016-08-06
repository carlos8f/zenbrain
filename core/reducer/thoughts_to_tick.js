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
      var bucket_id = tb(thought.time)
        .resize(c.bucket_size)
        .toString()
      groups[bucket_id] || (groups[bucket_id] = {thoughts: []})
      groups[bucket_id].thoughts.push(thought)
    })
    Object.keys(groups).forEach(function (bucket_id) {
      var g = groups[bucket_id]
      var new_thoughts = 0
      //get('logger').info('thoughts_to_buckets', bucket_id)
      passive_update('ticks', app_name + ':' + bucket_id, function (tick, done2) {
        if (!tick) {
          tick = {
            app: app_name,
            id: app_name + ':' + bucket_id,
            time: tb(bucket_id).toMilliseconds(),
            size: c.bucket_size,
            thought_ids: [],
            data: {}
          }
          //get('logger').info('thoughts_to_buckets', 'create', bucket.id)
        }
        else {
          //get('logger').info('thoughts_to_buckets', 'update', bucket.id)
        }
        g.tick = tick
        g.thoughts.forEach(function (thought) {
          if (tick.thought_ids.indexOf(thought.id) !== -1) {
            //console.error('dupe', thought.id, tick.thought_ids.length)
            return
          }
          new_thoughts++
          tick.thought_ids.push(thought.id)
        })
        //console.error('new', new_thoughts)
        if (!new_thoughts) {
          return done2(null, g.tick)
        }
        //console.error('new thoughts', new_thoughts)
        apply_funcs(g, get('thought_reducers'), function (err, g) {
          if (err) return done(err)
          tick_to_ticks(g.tick)
          done2(null, g.tick)
        })
      })
    })
  }
}