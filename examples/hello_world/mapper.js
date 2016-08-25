module.exports = function container (get, set, clear) {
  var map = get('map')
  return function mapper () {
    var c = get('config')
    setInterval(function () {
      get('logger').info('map')
      map('message', {
        text: 'Hello world!'
      })
    }, Math.round(c.map_interval * Math.random()))
  }
}