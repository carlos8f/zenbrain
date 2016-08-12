var colors = require('colors')

module.exports = function container (get, set, clear) {
  var get_tick_str = get('utils.get_tick_str')
  return function thought_reducer (g, cb) {
    var tick = g.tick, thoughts = g.thoughts
    // create a data key
    var d = tick.data
    d.messages || (d.messages = [])
    d.colors || (d.colors = [])
    thoughts.forEach(function (thought) {
      switch (thought.key) {
        case 'message':
          if (d.messages.indexOf(thought.value.text) === -1) {
            d.messages.push(thought.value.text)
          }
          break;
        case 'color':
          d.colors.push(thought.value)
          break;
      }
    })
    get('logger').info('thoughts', get_tick_str(tick.id), String(thoughts.length).grey)
    cb(null, g)
  }
}