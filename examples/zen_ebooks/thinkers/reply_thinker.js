var markov = require('markov')
  , parallel = require('run-parallel')
  , request = require('micro-request')

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
    if (rs.full_tweet_text.length > config.full_text_limit) {
      rs.full_tweet_text = rs.full_tweet_text.substring(rs.full_tweet_text.length - config.full_text_limit)
    }
    if (first_seed) {
      first_seed = false
      request('https://gist.githubusercontent.com/carlos8f/f532005697acd6a335bea63d99b72ff3/raw/zen.txt', function (err, resp, body) {
        if (err) throw err
        if (resp.statusCode !== 200) {
          console.error(body)
          throw new Error('non-200')
        }
        m.seed(body, function () {
          m.seed(rs.full_tweet_text, withTick)
        })
      })
    }
    else withTick()
    function withTick () {
      //get('logger').info('ebooks thinker', 'input', tick.tweet_text.white)
      m.seed(tick.tweet_text, function () {
        tick.replies.forEach(function (reply) {
          var tweet_text = '@' + reply.user.screen_name + ' ' + sanitize(m.respond(reply.text).join(' '))
          tweet_text = tweet_text.replace(/([\.\!\?\:])[^\.\!\?\:]+$/, '$1')
          if (tweet_text.length > 140) {
            tweet_text = tweet_text.substring(0, 139) + '-'
          }
          tweet_text = tweet_text.replace(/\s+/g, ' ')
          //get('logger').info('ebooks thinker', 'reply', tweet_text.white)
          rs.tweet_queue.push({
            text: tweet_text,
            in_reply_to_status_id: reply.id_str
          })
        })
        if (Math.random() <= config.new_tweet_chance) {
          var tweet_text = sanitize(m.fill(m.pick()).join(' '))
          tweet_text = tweet_text.replace(/([\.\!\?\:])[^\.\!\?\:]+$/, '$1')
          if (tweet_text.length > 140) {
            tweet_text = tweet_text.substring(0, 139) + '-'
          }
          tweet_text = tweet_text.replace(/\s+/g, ' ')
          //get('logger').info('ebooks thinker', 'reply', tweet_text.white)
          rs.tweet_queue.push({
            text: tweet_text
          })
        }
        cb()
      })
    }
  }
}