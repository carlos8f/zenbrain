module.exports = function container (get, set, clear) {
  return function message_reducer (t, cb) {
    var tick = t.tick, thoughts = t.thoughts, size = t.size
    tick.words || (tick.words = {})
    var messages = thoughts.filter(function (thought) {
      return thought.key === 'message'
    })
    messages.forEach(function (message) {
      var words = message.value.text.split(/\s+/)
      words.forEach(function (word) {
        word = word.toLowerCase().trim()
        if (!tick.words[word]) {
          tick.words[word] = 0
        }
        tick.words[word]++
      })
    })
    tick.unique_words = Object.keys(tick.words).length
    cb()
  }
}