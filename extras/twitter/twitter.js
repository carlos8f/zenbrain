var Twit = require('twit')

module.exports = function container (get, set) {
  var config = get('config')
  if (!config.twitter_key) {
    throw new Error('Twitter config not found. Please add it to config.js')
  }
  return new Twit({
    consumer_key: config.twitter_key,
    consumer_secret: config.twitter_secret,
    access_token: config.twitter_access_token,
    access_token_secret: config.twitter_access_token_secret
  })
}