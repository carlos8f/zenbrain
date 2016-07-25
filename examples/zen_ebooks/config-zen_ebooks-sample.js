module.exports = {
  mongo: {
    url: 'mongodb://localhost:27017/zen_ebooks',
    username: null,
    password: null
  },
  enabled_plugins: [
    'extras/twitter'
  ],
  verbose: true,
  full_text_limit: 16000,
  new_tweet_chance: 1
}