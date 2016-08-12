var c = module.exports = {}
c.enabled_plugins = [] // set to something like ['extras/twitter']
c.mongo_url = "mongodb://localhost:27017/zenbrain" // change if your mongo server isn't local
c.mongo_username = null // normally not needed
c.mongo_password = null
c.twitter_key = "" // create a twitter app, generate an access token, and add it here
c.twitter_secret = ""
c.twitter_access_token = ""
c.twitter_access_token_secret = ""
c.id_bytes = 8 // for random IDs
c.bucket_size = "1m"
c.reducer_limit = 500 // how many thoughts to process per reduce run
c.reducer_sizes = ["1m", "5m", "15m", "1h", "6h", "1d"]
c.save_state_interval = 10000 // save state
c.parallel_limit = 8 // run this many concurrent tasks
c.reduce_timeout = 2000
c.run_limit = 100
c.lock_timeout = 60000
c.lock_backoff = 20
c.lock_tries = 100
c.passive_update_timeout = 60000
c.return_timeout = 60000
c.brain_speed_ms = 1000
c.logic = function container (get, set, clear) {
  // these callbacks will run in order on every tick.
  // trigger an action with something like
  /*
  trigger({
    type: 'foo',
    some_prop: 'bar'
  })
  */
  // and the action will be queued for execution.
  return [
    function (tick, trigger, rs, cb) {
      cb()
    }
  ]
}
c.sim_limit = 100
c.sim_days = 90
