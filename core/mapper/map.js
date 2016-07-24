module.exports = function container (get, set, clear) {
  var get_id = get('utils.get_id')
  return function map (key, value, cb) {
    if (Object.prototype.toString.call(key) === '[object Object]') {
      value = key
      cb = value
      key = null
    }
    var thought = {
      id: get_id(),
      time: value && value.time || new Date().getTime(),
      key: key,
      value: value,
      processed: false
    }
    get('thoughts').save(thought, function (err, saved) {
      if (err) {
        if (cb) return cb(err)
      }
      cb && cb(null, saved)
    })
  }
}