module.exports = function container (get, set, clear) {
  return function message_reducer (t, cb) {
    get('logger').info('tweet reducer', 'reducing tweets...')
    cb()
  }
}