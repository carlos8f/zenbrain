module.exports = {
  _ns: 'zenbrain',
  'reporters.follow': require('./follow_reporter'),
  'reporters.tweet': require('./tweet_reporter'),
  'reporters[]': [
    '#reporters.follow',
    '#reporters.tweet'
  ]
}