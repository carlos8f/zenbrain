module.exports = function container (get, set, clear) {
  var get_tick_str = get('utils.get_tick_str')
  return function scanner (g, cb) {
    //get('logger').info('scanner', get_tick_str(g.tick.id))
    g.tick.data.scanned = true
    cb(null, g)
  }
}