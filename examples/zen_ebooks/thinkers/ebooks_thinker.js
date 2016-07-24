module.exports = function container (get, set, clear) {
  return function thinker (tick, cb) {
    get('logger').info('ebooks thinker', 'thinking...')
    cb()
  }
}