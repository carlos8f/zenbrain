module.exports = function container (get, set) {
  var get_timestamp = get('zenbot:utils.get_timestamp')
  return get('db.createCollection')('thoughts', {
    save: function (thought, opts, cb) {
      if (!thought.time) {
        thought.time = new Date().getTime()
        thought.timestamp = get_timestamp(thought.time)
        thought.processed = false
      }
      cb(null, thought)
    }
  })
}