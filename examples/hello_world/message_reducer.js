module.exports = function container (get, set, clear) {
  return function thought_reducer (g, cb) {
    var tick = g.tick, thoughts = g.thoughts
    // create a data key
    tick.data.messages = []
    // filter thoughts by key = message
    thoughts.forEach(function (thought) {
      if (thought.key !== 'message') {
        return
      }
      // migrate message text to the data key
      tick.data.messages.push(thought.value.text)
    })
    get('logger').info('reduce message')
    cb(null, g)
  }
}