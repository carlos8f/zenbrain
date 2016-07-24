var tb = require('timebucket')

module.exports = function container (get, set) {
  var get_timestamp = get('zenbrain:utils.get_timestamp')
  var apply_funcs = get('zenbrain:utils.apply_funcs')
  return get('db.createCollection')('ticks', {
    save: function (obj, opts, cb) {
      obj.timestamp = get_timestamp(obj.time)
      get('zenbrain:db').collection('ticks').update(
        {
          time: {
            $lt: obj.time
          },
          complete: false,
          size: obj.size
        },
        {
          $set: {
            complete: true
          }
        },
        {
          multi: true
        },
        function (err, result) {
          if (err) return cb(err)
          if (result.nModified) {
            get('logger').info('ticks', 'completed', result.nModified, 'ticks.')
          }
          apply_funcs({op: 'save', type: 'tick', obj: obj}, get('zenbrain:db_hooks'), cb)
        })
    }
  })
}