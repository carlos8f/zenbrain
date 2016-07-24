module.exports = function container (get, set, clear) {
  var map = get('map')
  var twitter = get('twitter')
  return function mapper (cb) {
    var stream = twitter.stream('user')
    stream.on('connect', function () {
      map('twitter_status', {message: 'Connected to Twitter.'})
    })
    stream.on('disconnect', function () {
      map('twitter_status', {message: 'Disconnected from Twitter.'})
    })
    stream.on('message', function (message) {
      map('twitter_message', message)
    })
    get('logger').info('tweet mapper', 'Mapping tweets...')
    cb()
  }
}