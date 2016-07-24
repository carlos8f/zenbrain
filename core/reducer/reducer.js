module.exports = function container (get, set, clear) {
  var c = get('core.constants')
  var process_thoughts = get('reducer.process_thoughts')
  // process unprocessed thoughts
  return function reducer (cb) {
    get('thoughts').select({query: {processed: false}, limit: c.reducer_limit}, function (err, thoughts) {
      if (err) return cb(err)
      process_thoughts(thoughts, function (err) {
        if (err) return cb(err)
        // return if we are idle or not
        return cb(null, !thoughts.length)
      })
    })
  }
}