module.exports = function container (get, set, clear) {
  var map = get('map')
  return function mapper () {
    // map a "hello world" message
    map('message', {text: 'hello, world!'})
  }
}