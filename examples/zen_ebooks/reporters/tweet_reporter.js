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
    if (!rs.tweet_queue) return cb()
    var tasks = rs.tweet_queue.map(function (tweet_info) {
      return function task (done) {
        twitter.post('statuses/update', {status: tweet_info.text}, function (err, data, resp) {
          if (err) return done(err)
          get('logger').info('tweet reporter', 'tweeted:'.cyan, data.text.white)
          done(null, data)
        })
      }
    })
    rs.tweet_queue = []
    parallel(tasks, cb)
  }
}