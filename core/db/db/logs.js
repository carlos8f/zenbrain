module.exports = function container (get, set) {
  var get_timestamp = get('zenbrain:utils.get_timestamp')
  var get_id = get('zenbrain:utils.get_id')
  var apply_funcs = get('zenbrain:utils.apply_funcs')
  return get('db.createCollection')('logs', {
    save: function (obj, opts, cb) {
      if (!obj.id) obj.id = get_id()
      obj.timestamp = get_timestamp(obj.time)
      apply_funcs({op: 'save', type: 'log', obj: obj}, get('zenbrain:db_hooks'), cb)
    }
  })
}