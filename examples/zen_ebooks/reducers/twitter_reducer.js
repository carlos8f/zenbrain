module.exports = function container (get, set, clear) {
  var c = get('core.constants')
  return function reducer (t, cb) {
    var rs = get('run_state')
    var tick = t.tick
    var accounts = t.thoughts.filter(function (thought) {
      return thought.key === 'twitter_account'
    })
    if (accounts.length) {
      rs.twitter_account = accounts[accounts.length - 1].value
    }
    var tweets = t.thoughts.filter(function (thought) {
      return thought.key === 'twitter_message' && thought.value.id_str
    }).map(function (thought) {
      return thought.value
    })
    if (!tick.tweet_text) tick.tweet_text = ''
    if (!tick.replies) tick.replies = []
    tweets.forEach(function (tweet) {
      tick.tweet_text += tweet.text + '\n'
      if (rs.twitter_account && tweet.in_reply_to_user_id_str === rs.twitter_account.id_str) {
        tick.replies.push(tweet)
      }
    })
    if (tick.size === c.brain_speed) {
      get('logger').info('twitter reducer', 'reduced', tick, {feed: 'reducer'})
    }
    cb()
  }
}