var parallel = require('run-parallel')

module.exports = function container (get, set) {
  return function ensure_indexes (cb) {
    var tasks = []
    tasks.push(function (done) {
      get('db.mongo.db').collection('ticks').ensureIndex({app: 1, time: 1, size: 1}, done)
    })
    tasks.push(function (done) {
      get('db.mongo.db').collection('logs').ensureIndex({app: 1, time: 1, feed: 1}, done)
    })
    tasks.push(function (done) {
      get('db.mongo.db').collection('thoughts').ensureIndex({app: 1, time: 1, key: 1}, done)
    })
    parallel(tasks, cb)
  }
}