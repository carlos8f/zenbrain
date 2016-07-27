var not_proper = [
  'Live',
  'Fire',
  'He',
  'The',
  'Hack',
  'Think',
  'Women',
  'Born',
  'Before',
  'Could',
  'Makes',
  'Crooked',
  'Black',
  'Hat',
  'Ruled',
  'Valley'
]
var not_proper_regex = new RegExp(' (' + not_proper.join('|') + ') ', 'g')

module.exports = function container (get, set, clear) {
  return function sanitize_tweet_text (text) {
    while (text.length > 135) {
      var words = text.split(/\s+/)
      text = words.slice(0, words.length - 1).join(' ')
    }
    var quote_match = text.match(/\'|\"/g)
    // strip unbalanced quotes
    if (quote_match && quote_match.length % 2 !== 0) {
      text = text.replace(/\'|\"/g, '')
    }

    return text
      // lowercase some words
      .replace(not_proper_regex, function (match, idx, full) { return match.toLowerCase() })
      // strip retweet
      .replace(/RT @[^\s]+\: /g, '')
      // strip handles
      .replace(/@[^\s]+/g, '')
      // strip links
      .replace(/http[^\s]+/g, '')
      // strip excessive whitespace
      .replace(/\s+/g, ' ')
      // strip spaces before punc
      .replace(/ ([\.\?\!\,\:])/g, '$1')
      // turn late commas into ellipses
      .replace(/(,)[^\.\!\?\:,]+$/, '...')
      // end at last punctuation
      .replace(/([\.\!\?\:])[^\.\!\?\:]+$/, '$1')
      // colons into periods
      .replace(/\:$/, '.')
  }
}