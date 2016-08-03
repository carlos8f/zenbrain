var config = module.exports = {}
config.enabled_plugins = [] // set to something like ['extras/twitter']
config.mongo_url = "mongodb://localhost:27017/zenbrain" // change if your mongo server isn't local
config.mongo_username = null // normally not needed
config.mongo_password = null
config.twitter_key = "" // create a twitter app, generate an access token, and add it here
config.twitter_secret = ""
config.twitter_access_token = ""
config.twitter_access_token_secret = ""
config.id_bytes = 8 // for random IDs
config.brain_speed = "1m"
config.brain_speed_ms = 60000 // same in ms
config.reducer_limit = 1000 // how many thoughts to process per reduce run
config.reducer_sizes = ["1m", "5m", "15m", "1h", "6h", "1d"]
config.save_state_interval = 10000 // save state
config.parallel_limit = 8 // run this many concurrent tasks
config.reduce_timeout = 1000
config.mark_complete_limit = 1000