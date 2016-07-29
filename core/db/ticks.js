var tb = require('timebucket')

module.exports = function container (get, set) {
  var get_timestamp = get('zenbrain:utils.get_timestamp')
  var apply_funcs = get('zenbrain:utils.apply_funcs')
  var mark_complete = get('zenbrain:utils.mark_complete')
  return get('db.createCollection')('ticks', {
    save: function (obj, opts, cb) {
      obj.app_name = get('zenbrain:app_name')
      obj.timestamp = get_timestamp(obj.time)
      mark_complete(obj.time, obj.size, function (err) {
        if (err) return cb(err)
        apply_funcs({op: 'save', type: 'tick', obj: obj}, get('zenbrain:db_hooks'), cb)
      })
    }
  })
}