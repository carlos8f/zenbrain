module.exports = function container (get, set) {
  var get_timestamp = get('zenbrain:utils.get_timestamp')
  var apply_funcs = get('zenbrain:utils.apply_funcs')
  return get('db.createCollection')('run_states', {
    save: function (obj, opts, cb) {
      obj.timestamp = get_timestamp(obj.time)
      apply_funcs({op: 'save', type: 'run_state', obj: obj}, get('zenbrain:db_hooks'), cb)
    }
  })
}