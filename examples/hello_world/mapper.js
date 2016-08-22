var markov = require('markov')
  , request = require('micro-request')
  , colors = require('colors')

module.exports = function container (get, set, clear) {
  var map = get('map')
  return function mapper () {
    var c = get('config')
    // map some random zen advice
    var m = markov()
    var uri = c.seed_text_url
    get('logger').info('fetching', uri.grey)
    request(uri, function (err, resp, body) {
      if (err) throw err
      if (resp.statusCode !== 200) {
        console.error(body)
        throw new Error('non-200')
      }
      m.seed(body, function () {
        get('logger').info('seeded')
        setInterval(function () {
          var text = m.fill(m.pick(), Math.max(c.min_message_words, Math.round(Math.random() * c.max_message_words))).join(' ')
          map('message', {
            text: text
          })
          get('logger').info('map', String(text.length).grey)
        }, c.map_interval)
      })
    })
  }
}