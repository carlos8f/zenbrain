module.exports = {
  mongo: {
    url: 'mongodb://localhost:27017/zen_crawler',
    username: null,
    password: null
  },
  crawler: {
    start_url: 'https://s8f.org/',
    queue_limit: 100000
  }
}