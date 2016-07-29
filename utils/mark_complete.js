var tb = require('timebucket')

module.exports = function container (get, set, clear) {
  return function (time, size, cb) {
    if (!time) time = tb(size).toMilliseconds()
    get('db').collection('ticks').update(
      {
        app_name: get('app_name'),
        time: {
          $lt: time
        },
        complete: false,
        size: size
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
          get('logger').info('mark_complete', 'completed', result.nModified, size, 'ticks.')
        }
        cb()
      })
  }
}