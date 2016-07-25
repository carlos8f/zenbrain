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
        map('twitter_message', message)
        if (message.id_str) {
          get('logger').info('tweet mapper', 'saw tweet', ('@' + message.user.screen_name).cyan, message.text.white, {feed: 'mapper'})
        }
      })
      get('logger').info('tweet mapper', 'Mapping tweets...')
      cb()
    })
  }
}