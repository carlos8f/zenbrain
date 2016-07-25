module.exports = function container (get, set, clear) {
  return function sanitize_tweet_text (text) {
    return text
      // strip retweet
      .replace(/RT @[^\s]+\: /g, '')
      // strip handles
      .replace(/@[^\s]+/g, '')
      // strip links
      .replace(/http[^\s]+/g, '')
      // strip excessive whitespace
      .replace(/\s+/g, ' ')
      // strip spaces before punc
      .replace(/ [\.\?\!]/g, '.')
  }
}