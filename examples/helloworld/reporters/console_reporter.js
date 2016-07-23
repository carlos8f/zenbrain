module.exports = function container (get, set, clear) {
  return function console_reporter (cb) {
    var rs = get('run_state')
    get('logger').info('id=', rs.last_tick.id, 'thoughts=', rs.last_tick.thoughts, 'unique_words=', rs.last_tick.unique_words, {feed: 'public'})
    cb()
  }
}