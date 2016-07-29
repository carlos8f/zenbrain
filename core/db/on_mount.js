var parallel = require('run-parallel-limit')

module.exports = function container (get, set) {
  var c = get('zenbrain:config')
  return function ensure_indexes (cb) {
    var tasks = []
    tasks.push(function (done) {
      get('db.mongo.db').collection('ticks').ensureIndex({app_name: 1, time: 1, complete: 1}, done)
    })
    tasks.push(function (done) {
      get('db.mongo.db').collection('logs').ensureIndex({time: -1, app_name: 1, feed: 1}, done)
    })
    tasks.push(function (done) {
      get('db.mongo.db').collection('thoughts').ensureIndex({app_name: 1, processed: 1}, done)
    })
    tasks.push(function (done) {
      get('db.mongo.db').collection('thoughts').ensureIndex({app_name: 1, key: 1}, done)
    })
    parallel(tasks, c.parallel_limit, cb)
  }
}