var c = module.exports = {}
c.mongo_url = "mongodb://localhost:27017/zenbrain"
config.bucket_size = "1s"
config.reducer_sizes = ["1m", "5m"]
c.logic = function container (get, set, clear) {
  return [
    function (tick, trigger, cb) {
      // act only on second ticks
      if (tick.size !== '1s' || !tick.data.messages) return cb()
      trigger({
        action: 'console_log',
        text: tick.data.messages.join('\n')
      })
      cb()
    }
  ]
}