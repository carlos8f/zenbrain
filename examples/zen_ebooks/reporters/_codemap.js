module.exports = {
  _ns: 'zenbrain',
  'reporters.tweet': require('./tweet_reporter'),
  'reporters[]': '#reporters.tweet'
}