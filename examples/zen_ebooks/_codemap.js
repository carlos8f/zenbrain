module.exports = {
  _ns: 'zenbrain',
  'mappers.twitter': require('./mapper'),
  'mappers[]': '#mappers.twitter',
  'reducers.twitter': require('./reducer'),
  'reducers[]': '#reducers.twitter',
  'thinkers.follow': require('./follow_thinker'),
  'thinkers.reply': require('./reply_thinker'),
  'thinkers[]': [
    '#thinkers.follow',
    '#thinkers.reply'
  ],
  'utils.sanitize_tweet_text': require('./sanitize_tweet_text')
}