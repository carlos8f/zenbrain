module.exports = function container (get, set, clear) {
  return function message_mapper (message) {
    var helloworld_message = {
      message: message
    }
    get('motley:db.helloworld_messages').save(helloworld_message, function (err, saved) {
      if (err) {
        get('logger').error('err saving message', err)
      }
    })
  }
}