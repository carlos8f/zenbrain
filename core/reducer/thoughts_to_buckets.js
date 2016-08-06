var parallel = require('run-parallel')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var app_name = get('app_name')
  var apply_funcs = get('utils.apply_funcs')
  var bucket_to_tick = get('bucket_to_tick')
  var passive_update = get('utils.passive_update')
  var get_timestamp = get('utils.get_timestamp')
  return function thoughts_to_buckets (thoughts) {
    //get('logger').info('thoughts_to_buckets', thoughts.length, get_timestamp(thoughts[0].time))
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
          //get('logger').info('thoughts_to_buckets', 'create', bucket.id)
        }
        else {
          //get('logger').info('thoughts_to_buckets', 'update', bucket.id)
        }
        g.bucket = bucket
        g.thoughts.forEach(function (thought) {
          if (bucket.thought_ids.indexOf(thought.id) !== -1) {
            //console.error('dupe', thought.id, bucket.thought_ids.length)
            return
          }
          new_thoughts++
          bucket.thought_ids.push(thought.id)
        })
        //console.error('new', new_thoughts)
        if (!new_thoughts) {
          return done2(null, g.bucket)
        }
        //console.error('new thoughts', new_thoughts)
        bucket_to_tick(g.bucket)
        apply_funcs(g, get('thought_reducers'), function (err) {
          if (err) return done(err)
          done2(null, g.bucket)
        })
      })
    })
  }
}