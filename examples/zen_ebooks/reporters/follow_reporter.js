var colors = require('colors')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var twitter = get('twitter')
  var c = get('core.constants')
  return function reporter (tick, cb) {
    if (tick.size !== c.brain_speed) return cb()
    var rs = get('run_state')
    //get('logger').info('tweet reporter', 'Reporting...')
    //get('logger').info('tweet reporter', 'rs', rs, {feed: 'debug'})
    var tasks = rs.follow_queue.map(function (follow_info) {
      return function task (done) {
        twitter.post('friendships/create', {user_id: follow_info.id_str, follow: true}, function (err, data, resp) {
          if (err) return done(err)
          if (data && data.screen_name) {
            get('logger').info('follow reporter', 'followed:'.cyan, ('@' + data.screen_name).white, ('(' + data.name + ')').yellow, {feed: 'reporter'})
          }
          done(null, data)
        })
      }
    })
    rs.follow_queue = []
    parallel(tasks, cb)
  }
}