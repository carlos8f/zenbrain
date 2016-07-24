var Twit = require('twit')

module.exports = function container (get, set) {
  var config = get('config').twitter
  if (!config || !config.secret) {
    throw new Error('Twitter config not found. Please add it to ~/.zenbrain/config-core.js')
  }
  return new Twit({
    consumer_key: config.key,
    consumer_secret: config.secret,
    access_token: config.access_token,
    access_token_secret: config.access_token_secret
  })
}