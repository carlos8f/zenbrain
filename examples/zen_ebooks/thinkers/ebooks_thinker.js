var markov = require('markov')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var m = markov()
  var sanitize = get('utils.sanitize_tweet_text')
  var first_seed = true
  var config = get('config')
  return function thinker (tick, cb) {
    var rs = get('run_state')
    if (!rs.tweet_queue) {
      rs.tweet_queue = []
    }
    if (!rs.full_tweet_text) {
      rs.full_tweet_text = ''
    }
    //get('logger').info('ebooks thinker', 'tick', tick, {feed: 'ticks'})
    if (!tick.tweet_text) return cb()
    rs.full_tweet_text += tick.tweet_text + '\n'
    rs.full_tweet_text = rs.full_tweet_text.substring(config.full_text_limit)
    if (first_seed) {
      m.seed(rs.full_tweet_text, withTick)
    }
    else withTick()
    function withTick () {
      get('logger').info('ebooks thinker', 'input', tick.tweet_text.white)
      m.seed(tick.tweet_text, function () {
        var tasks = tick.replies.map(function (reply) {
          return function task (done) {
            var tweet_text = '@' + reply.user.screen_name + ' ' + sanitize(m.respond(reply.text).join(' '))
            if (tweet_text.length > 140) {
              tweet_text = tweet_text.substring(0, 139) + '-'
            }
            tweet_text = tweet_text.replace(/\s+/g, ' ')
            get('logger').info('ebooks thinker', 'reply', tweet_text.white)
            rs.tweet_queue.push({
              text: tweet_text
            })
            done()
          }
        })
        parallel(tasks, cb)
      })
    }
  }
}