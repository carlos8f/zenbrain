var markov = require('markov')
  , request = require('micro-request')
  , assert = require('assert')

var sentence_regex = /["']?[A-Z][^.?!]+((?![.?!]['"]?\s["']?[A-Z][^.?!]).)+[.?!'"]+/g

var bad_patterns = [
  'and and ',
  'the the ',
  'the and ',
  'his an ',
  'for to ',
  'stupidity it\'s',
  'min and ',
  'it\'s approach ',
  'driving can ',
  'you year ',
  'there\'s of ',
  'see replied ',
  'the I ',
  'agreed time ',
  'he it ',
  'back bandit ',
  'Put asked ',
  'the is ',
  'in The ',
  'the have ',
  'they local ',
  'the had ',
  'boy what ',
  'see is ',
  'stepped About ',
  'Brazil been ',
  'a a ',
  'for or ',
  'out of I ',
  'into out ',
  'I\'m year ',
  'long It ',
  'the if ',
  'asked order ',
  'in must ',
  'the was ',
  'policies read ',
  'can essential ',
  'has an ',
  'an that ',
  'is idea ',
  'what have ',
  'have listening ',
  'you what ',
  'happens This ',
  ', out.',
  ', him why',
  'to Of',
  'have sure ',
  'asked chuckled ',
  'and The ',
  'an that ',
  'in are ',
  'an through ',
  'from for ',
  'Bu finally ',
  'all I ',
  'finally as ',
  'as when ',
  'with nothing ',
  'even wait ',
  'he\' ',
  'Him Why ',
  'of are ',
  'has When ',
  'a you',
  'the I\'m',
  'comes Do ',
  'from for ',
]

module.exports = function container (get, set, clear) {
  var m = markov()
  var sanitize = get('utils.sanitize_tweet_text')
  var first_seed = true
  return function thinker (tick, cb) {
    var c = get('config')
    var rs = get('run_state')
    if (!rs.tweet_queue) {
      rs.tweet_queue = []
    }
    if (!rs.message_queue) {
      rs.message_queue = []
    }
    if (!rs.full_tweet_text) {
      rs.full_tweet_text = ''
    }
    //get('logger').info('ebooks thinker', 'tick', tick, {feed: 'ticks'})
    //if (!tick.tweet_text) return cb()
    rs.full_tweet_text += tick.tweet_text + '\n'
    if (rs.full_tweet_text.length > config.full_text_limit) {
      rs.full_tweet_text = rs.full_tweet_text.substring(rs.full_tweet_text.length - c.ebooks_full_text_limit)
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
      function validateReply (func) {
        var valid = false, reply_text
        while (!valid) {
          reply_text = sanitize(func())
          var sentence_match = reply_text.match(sentence_regex)
          if (sentence_match) {
            reply_text = sentence_match.join(' ')
          }
          try {
            bad_patterns.forEach(function (pat) {
              if (reply_text.indexOf(pat) !== -1) {
                throw new Error('bad pattern: ' + pat)
              }
            })
            valid = true
          }
          catch (e) {}
        }
        return reply_text
      }
      //get('logger').info('ebooks thinker', 'input', tick.tweet_text.white, tick.replies.length, 'replies')
      m.seed(tick.tweet_text, function () {
        tick.replies.forEach(function (reply) {
          var reply_text = validateReply(function () {
            return m.respond(reply.text).join(' ')
          })
          var tweet_text = '@' + reply.user.screen_name + ' ' + reply_text
          get('logger').info('ebooks thinker', 'reply', tweet_text.white)
          rs.tweet_queue.push({
            text: tweet_text,
            in_reply_to_status_id: reply.id_str
          })
        })
        tick.messages.forEach(function (direct_message) {
          var reply_text = validateReply(function () {
            //console.error('direct_message', direct_message)
            return m.respond(direct_message.text).join(' ')
          })
          rs.message_queue.push({
            text: reply_text,
            direct_message: direct_message
          })
        })
        var roll = Math.random()
        get('logger').info('ebooks thinker', 'roll', roll, '/', c.ebooks_new_tweet_chance)
        if (roll <= c.ebooks_new_tweet_chance) {
          var tweet_text = validateReply(function () {
            return m.fill(m.pick()).join(' ')
          })
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