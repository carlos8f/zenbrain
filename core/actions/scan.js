var colors = require('colors')

module.exports = function container (get, set, clear) {
  return function () {
    var c = get('config')
    if (get('args').length) {
      throw new Error('unknown arg')
    }
    get('scanners').forEach(function (scanner) {
      ;(function scan () {
        scanner(function (err) {
          if (err) {
            console.error(err)
            get('logger').error('scan err', err, {feed: 'errors'})
            if (err.name === 'MongoError') {
              throw err
            }
          }
          setTimeout(scan, c.scan_timeout)
        })
      })()
    })
  }
}