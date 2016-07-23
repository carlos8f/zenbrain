module.exports = function container (get, set, clear) {
  var message_mapper = get('mappers.message')
  return function say (message, options) {
    if (options.limit) {
      message = message.substring(0, options.limit)
    }
    message_mapper(message)
  }
}