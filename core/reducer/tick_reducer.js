module.exports = function container (get, set, clear) {
  var c = get('config')
  var process_ticks = get('process_ticks')
  // process unprocessed thoughts
  return function reducer (cb) {
    //var before = new Date().getTime()
    get('ticks').select({
      query: {
        app_name: get('app_name'),
        size: c.brain_speed,
        processed: false
      },
      limit: c.reducer_limit,
      sort: {
        time: 1
      }
    }, function (err, ticks) {
      //get('logger').info('reducer query', new Date().getTime() - before, 'ms')
      if (err) return cb(err)
      if (!ticks.length) {
        return cb(null, true)
      }
      //get('logger').info('reducer', 'processing thoughts...'.grey, thoughts.length)
      process_ticks(ticks, function (err, idle) {
        if (err) return cb(err)
        cb(null, false)
      })
    })
  }
}