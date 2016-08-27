var n = require('numbro')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var thoughts_to_tick = get('thoughts_to_tick')
  var get_tick_str = get('utils.get_tick_str')
  // process unprocessed thoughts
  var thought_ids = []
  return function thought_reducer (cb) {
    var c = get('config')
    //get('logger').info('thought_reducer')
    var before = new Date().getTime()
    var returned = false
    setTimeout(function () {
      if (!returned) {
        console.error('thought reducer did not return')
      }
    }, c.return_timeout)
    get('thoughts').select({
      query: {
        app: get('app_name')
      },
      limit: c.reducer_limit,
      sort: {
        time: -1
      }
    }, function (err, thoughts) {
      if (err) return cb(err)
      if (!thoughts.length) {
        //get('logger').info('thought_reducer', 'idle'.grey)
        returned = true
        return cb(null, true)
      }
      //get('logger').info('reducer query', new Date().getTime() - before, 'ms')
      //get('logger').info('reducer', 'processing thoughts...'.grey, thoughts.length)
      thoughts.forEach(function (thought) {
        if (thought_ids.indexOf(thought.id) !== -1) {
          //console.error('reducer dupe', thought.id)
          return
        }
        thought_ids.push(thought.id)
      })
      get('db').collection('thoughts').remove({
        _id: {
          $in: thoughts.map(function (thought) { return thought.id })
        }
      }, function (err) {
        if (err) return cb(err)
        //get('logger').info('thought_reducer', get_tick_str(tb(thoughts[0].time).resize('1h').toString()), 'oldest hour'.grey)
        thoughts_to_tick(thoughts)
        returned = true
        cb(null, false)
      })
    })
  }
}