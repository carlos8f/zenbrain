module.exports = function container (get, set, clear) {
  var get_id = get('utils.get_id')
  return function map (key, value, cb) {
    var thought = {
      id: key + ':' + (value.id || get_id()),
      key: key,
      value: value,
      time: value.time || new Date().getTime(),
      status: 'unprocessed'
    }
    get('thoughts').save(thought, function (err, saved) {
      if (err) {
        if (cb) return cb(err)
      }
      cb && cb(null, saved)
    })
  }
}