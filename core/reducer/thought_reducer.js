module.exports = function container (get, set, clear) {
  var c = get('config')
  var process_thoughts = get('process_thoughts')
  // process unprocessed thoughts
  return function reducer (cb) {
    //var before = new Date().getTime()
    get('thoughts').select({
      query: {
        app_name: get('app_name'),
        processed: false
      },
      limit: c.reducer_limit,
      sort: {
        time: 1
      }
    }, function (err, thoughts) {
      //get('logger').info('reducer query', new Date().getTime() - before, 'ms')
      if (err) return cb(err)
      if (!thoughts.length) {
        return cb(null, true)
      }
      //get('logger').info('reducer', 'processing thoughts...'.grey, thoughts.length)
      process_thoughts(thoughts, function (err, idle) {
        if (err) return cb(err)
        cb(null, false)
      })
    })
  }
}