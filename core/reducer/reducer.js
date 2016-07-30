module.exports = function container (get, set, clear) {
  var c = get('config')
  var process_thoughts = get('reducer.process_thoughts')
  // process unprocessed thoughts
  return function reducer (cb) {
    get('thoughts').select({query: {app_name: get('app_name'), processed: false}, limit: c.reducer_limit}, function (err, thoughts) {
      if (err) return cb(err)
      //console.error('processing thoughts...', thoughts.length)
      if (!thoughts.length) {
        return cb(null, true)
      }
      process_thoughts(thoughts, function (err, idle) {
        if (err) return cb(err)
        cb(null, false)
      })
    })
  }
}