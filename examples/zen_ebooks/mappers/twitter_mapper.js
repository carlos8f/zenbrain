var Entities = require('html-entities').AllHtmlEntities
var entities = new Entities()

module.exports = function container (get, set, clear) {
  var map = get('map')
  var twitter = get('twitter')
  return function mapper (cb) {
    twitter.get('account/verify_credentials', function (err, data, resp) {
      if (err) return cb(err)
      map('twitter_account', data)
      var stream = twitter.stream('user')
      stream.on('connect', function () {
        map('twitter_status', {message: 'Connected to Twitter.'})
      })
      stream.on('disconnect', function () {
        map('twitter_status', {message: 'Disconnected from Twitter.'})
      })
      stream.on('message', function (message) {
        if (message.id_str && message.text) {
          message.text = entities.decode(message.text)
          get('logger').info('tweet mapper', 'tweet', ('@' + message.user.screen_name).cyan, message.text.white, {feed: 'mapper'})
        }
        else if (message.event) {
          get('logger').info('tweet mapper', 'event', message.event, {feed: 'mapper'})
        }
        else {
          //get('logger').info('tweet mapper', 'message', message, {feed: 'mapper'})
        }
        map('twitter_message', message)
      })
      get('logger').info('tweet mapper', 'Mapping tweets...')
      cb()
    })
  }
}