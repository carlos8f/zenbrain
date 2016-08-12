var c = module.exports = {}
c.mongo_url = "mongodb://localhost:27017/zenbrain"
c.bucket_size = "1s"
c.reducer_sizes = ["1s", "5s", "20s", "1m"]
c.map_interval = 2500
c.reduce_timeout = 200
c.seed_text_url = 'https://gist.githubusercontent.com/carlos8f/59a6317ce0ede315d0df3811bb37533d/raw/gistfile1.txt'
c.min_message_words = 4
c.max_message_words = 10
c.passive_update_timeout = 1000
c.logic = function container (get, set, clear) {
  var get_tick_str = get('utils.get_tick_str')
  return [
    function (tick, trigger, rs, cb) {
      get('logger').info('logic', get_tick_str(tick.id))
      if (!tick.data.messages || !tick.data.messages.length) return cb()
      trigger({
        type: 'console_log',
        text: tick.data.messages.join(', ')
      })
      cb()
    }
  ]
}