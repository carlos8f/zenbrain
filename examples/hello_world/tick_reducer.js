module.exports = function container (get, set, clear) {
  return function tick_reducer (g, cb) {
    var tick = g.tick, sub_tick = g.sub_tick
    // create a data key on the new tick
    tick.data.messages || (tick.data.messages = [])
    // migrate the sub tick's messages to new tick
    tick.data.messages = tick.data.messages.concat(sub_tick.data.messages)
    cb(null, g)
  }
}