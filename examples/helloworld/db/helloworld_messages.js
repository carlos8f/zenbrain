module.exports = function container (get, set) {
  return get('db.createCollection')('helloworld_messages', {
    save: function (helloworld_message, opts, cb) {
      cb(null, helloworld_message)
    }
  })
}