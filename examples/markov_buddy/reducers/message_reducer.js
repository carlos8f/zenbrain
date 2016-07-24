module.exports = function container (get, set, clear) {
  return function message_reducer (t, cb) {
    var tick = t.tick, thoughts = t.thoughts, size = t.size
    var messages = thoughts.filter(function (thought) {
      return thought.key === 'message'
    })
    if (!tick.messages) {
      tick.messages = []
    }
    messages.forEach(function (thought) {
      tick.messages.push(thought.value.text)
    })
    get('logger').info('message reducer', 'reduced', size, tick.id, messages.length)
    cb()
  }
}