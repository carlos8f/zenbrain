var colors = require('colors')

module.exports = function container (get, set, clear) {
  var c = get('config')
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
    var events = t.thoughts.filter(function (thought) {
      return thought.key === 'twitter_message' && thought.value.event
    }).map(function (thought) {
      return thought.value
    })
    var messages = t.thoughts.filter(function (thought) {
      return thought.key === 'twitter_message' && thought.value.direct_message
    }).map(function (thought) {
      return thought.value.direct_message
    })
    var friends = t.thoughts.filter(function (thought) {
      return thought.key === 'twitter_friend' && thought.value
    }).map(function (thought) {
      return thought.value
    })
    //get('logger').info('twitter reducer', 'thoughts', t.thoughts, {feed: 'reducer'})
    if (!tick.tweet_text) tick.tweet_text = ''
    if (!tick.replies) tick.replies = []
    if (!tick.follows) tick.follows = []
    if (!tick.messages) tick.messages = []
    tweets.forEach(function (tweet) {
      // reply to replies
      tick.tweet_text += tweet.text + '\n'
      if (rs.twitter_account && tweet.in_reply_to_user_id_str === rs.twitter_account.id_str && tweet.user.id_str !== rs.twitter_account.id_str) {
        tick.replies.push(tweet)
      }
    })
    events.forEach(function (event) {
      // follow people
      if (event.event === 'follow' || event.event === 'quoted_tweet' || event.event === 'favorite' || event.event === 'list_member_added') {
        if (rs.twitter_account && event.source.id_str !== rs.twitter_account.id_str) {
          tick.follows.push(event.source)
        }
      }
      // reply to tweets I favorite
      if (event.event === 'favorite' && event.source.id_str === rs.twitter_account.id_str) {
        tick.replies.push(event.target_object)
      }
    })
    friends.forEach(function (friend) {
      // tweet at new friends
      if (friend.status) {
        var tweet = JSON.parse(JSON.stringify(friend.status))
        tweet.user = friend
        tick.replies.push(tweet)
        if (tick.size === c.brain_speed) {
          get('logger').info('tweet reducer', 'going to reply to new friends status:'.yellow, ('@' + friend.screen_name).cyan, tweet.text.white)
        }
      }
    })
    messages.forEach(function (direct_message) {
      // answer messages
      if (rs.twitter_account && direct_message.sender.id_str !== rs.twitter_account.id_str) {
        tick.messages.push(direct_message)
        if (tick.size === c.brain_speed) {
          get('logger').info('tweet reducer', 'got pm:'.yellow, ('@' + direct_message.sender.screen_name).cyan, direct_message.text.white)
        }
      }
    })
    if (tick.size === c.brain_speed) {
      //get('logger').info('twitter reducer', 'reduced', tick, {feed: 'reducer'})
    }
    cb()
  }
}