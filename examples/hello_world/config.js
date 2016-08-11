var c = module.exports = {}
c.mongo_url = "mongodb://localhost:27017/zenbrain"
c.bucket_size = "1s"
c.reducer_sizes = ["1m", "5m"]
c.map_interval = 5000
c.logic = function container (get, set, clear) {
  return [
    function (tick, trigger, rs, cb) {
      // act only on second ticks
      if (tick.size !== '1s' || !tick.data.messages.length) return cb()
      trigger({
        type: 'console_log',
        text: tick.data.messages.join('\n')
      })
      cb()
    }
  ]
}