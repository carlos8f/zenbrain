module.exports = function container (get, set, clear) {
  return function log_db_event (info, cb) {
    if (info.type !== 'log' && info.type !== 'run_state') {
      get('logger').info('db', info, {feed: 'db'})
    }
    cb()
  }
}