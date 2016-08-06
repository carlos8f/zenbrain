var parallel = require('run-parallel')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var app_name = get('app_name')
  var apply_funcs = get('utils.apply_funcs')
  var bucket_to_tick = get('bucket_to_tick')
  var passive_update = get('utils.passive_update')
  return function thoughts_to_buckets (thoughts) {
    //get('logger').info('thoughts_to_buckets', thoughts.length)
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
      passive_update('buckets', app_name + ':' + bucket_id, function (bucket, done2) {
        if (!bucket) {
          bucket = {
            app: app_name,
            id: app_name + ':' + bucket_id,
            time: tb(bucket_id).toMilliseconds(),
            size: c.bucket_size,
            thought_ids: [],
            data: {}
          }
        }
        g.bucket = bucket
        g.thoughts.forEach(function (thought) {
          if (bucket.thought_ids.indexOf(thought.id) !== -1) {
            return
          }
          new_thoughts++
          bucket.thought_ids.push(thought.id)
        })
        if (!new_thoughts) {
          return done2(null, g.bucket)
        }
        apply_funcs(g, get('thought_reducers'), function (err) {
          if (err) return done(err)
          bucket_to_tick(g.bucket)
          done2(null, g.bucket)
        })
      })
    })
  }
}