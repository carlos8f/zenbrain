var markov = require('markov')
  , request = require('micro-request')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var map = get('map')
  return function mapper () {
    // map some random zen advice
    var m = markov()
    var uri = 'https://gist.githubusercontent.com/carlos8f/59a6317ce0ede315d0df3811bb37533d/raw/gistfile1.txt'
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
          var text = m.fill(m.pick(), Math.max(4, Math.round(Math.random() * 12))).join(' ')
          map('message', {
            text: text
          })
          get('logger').info('map')
        }, c.map_interval)
      })
    })
  }
}