module.exports = function container (get, set, clear) {
  return function console_reporter (tick, cb) {
    var rs = get('run_state')
    get('logger').info('console reporter', 'reporting...')
    cb()
  }
}