module.exports = function container (get, set, clear) {
  var map = get('map')
  return function say (text, options) {
    if (options.limit && text.length > options.limit) {
      if (text.length < 4) {
        text = text.substring(0, options.limit)
      }
      else {
        text = text.substring(0, options.limit - 3) + '...'
      }
    }
    map('message', {text: text, limit: options.limit || null}, function (err, thought) {
      if (err) {
        console.error(err)
        get('logger').error('map err')
      }
      get('logger').info('say', thought, {feed: 'messages'})
      get('app').close(function () {
        process.exit()
      })
    })
  }
}