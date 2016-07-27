var colors = require('colors')
  , parallel = require('run-parallel-limit')

module.exports = function container (get, set, clear) {
  var twitter = get('twitter')
  var c = get('core.constants')
  return function reporter (tick, cb) {
    if (tick.size !== c.brain_speed) return cb()
    var rs = get('run_state')
    //get('logger').info('tweet reporter', 'Reporting...')
    //get('logger').info('tweet reporter', 'rs', rs, {feed: 'debug'})
    if (!rs.tweet_queue) return cb()
    var tasks = rs.tweet_queue.map(function (tweet_info) {
      return function task (done) {
        twitter.post('statuses/update', {status: tweet_info.text, in_reply_to_status_id: tweet_info.in_reply_to_status_id}, function (err, data, resp) {
          if (err) return done(err)
          get('logger').info('tweet reporter', 'tweeted:'.cyan, data.text.white)
          done(null, data)
        })
      }
    }).concat(rs.message_queue.map(function (info) {
      return function task (done) {
        twitter.post('direct_messages/new', {user_id: info.direct_message.sender.id_str, text: info.text}, function (err, data, resp) {
          if (err) return done(err)
          get('logger').info('tweet reporter', 'got pm:'.yellow, info.direct_message.text.white)
          get('logger').info('tweet reporter', 'replied:'.cyan, data.text.white)
          done(null, data)
        })
      }
    }))
    console.error('tasks', tasks)
    rs.tweet_queue = []
    rs.message_queue = []
    parallel(tasks, c.parallel_limit, cb)
  }
}