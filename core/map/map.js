module.exports = function container (get, set, clear) {
  var get_id = get('utils.get_id')
  return function map (key, value, cb) {
    var thought = {
      id: key || get_id(),
      value: value,
      processed: false
    }
    get('thoughts').save(thought, function (err, saved) {
      if (err) {
        if (cb) return cb(err)
      }
      cb && cb()
    })
  }
}