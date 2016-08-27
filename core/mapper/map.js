module.exports = function container (get, set, clear) {
  var get_id = get('utils.get_id')
  var get_timestamp = get('utils.get_timestamp')
  return function map (key, value, cb) {
    var id = value.id
    if (typeof id === 'undefined') {
      id = get_id()
    }
    var thought = {
      app: get('app_name'),
      id: get('app_name') + ':' + id,
      key: key,
      value: value,
      time: value.time || new Date().getTime()
    }
    //get('logger').info('map', get_timestamp(thought.time).grey, {feed: 'mapper'})
    get('thoughts').save(thought, function (err, saved) {
      if (err) {
        if (cb) return cb(err)
      }
      cb && cb(null, saved)
    })
  }
}