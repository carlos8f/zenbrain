module.exports = function container (get, set, clear) {
  var get_tick_str = get('utils.get_tick_str')
  return function thought_reducer (g, cb) {
    var tick = g.tick, thoughts = g.thoughts
    //get('logger').info('thought_reducer', get_tick_str(tick.id))
    var d = tick.data
    d.messages || (d.messages = [])
    thoughts.forEach(function (thought) {
      if (thought.key === 'message') {
        d.messages.push(thought.value.text)
      }
    })
    get('logger').info('thought_reducer', get_tick_str(tick.id), d.messages.length)
    cb(null, g)
  }
}