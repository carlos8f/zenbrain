module.exports = function container (get, set) {
  var get_timestamp = get('zenbrain:utils.get_timestamp')
  var apply_funcs = get('zenbrain:utils.apply_funcs')
  return get('db.createCollection')('thoughts', {
    save: function (obj, opts, cb) {
      obj.app_name = get('zenbrain:app_name')
      if (!obj.time) {
        obj.time = new Date().getTime()
        obj.timestamp = get_timestamp(obj.time)
        obj.processed = false
      }
      apply_funcs({op: 'save', type: 'thought', obj: obj}, get('zenbrain:db_hooks'), cb)
    }
  })
}