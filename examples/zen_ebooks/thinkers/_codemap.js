module.exports = {
  _ns: 'zenbrain',
  'thinkers.follow': require('./follow_thinker'),
  'thinkers.reply': require('./reply_thinker'),
  'thinkers[]': [
    '#thinkers.follow',
    '#thinkers.reply'
  ]
}