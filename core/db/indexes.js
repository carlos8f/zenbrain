var parallel = require('run-parallel')
  , bytes = require('bytes')

module.exports = function container (get, set) {
  var c = get('zenbrain:config')
  return function ensure_indexes (cb) {
    var tasks = []
    tasks.push(function (done) {
      get('db.mongo.db').collection('ticks').ensureIndex({app: 1, time: 1, size: 1}, done)
    })
    tasks.push(function (done) {
      get('db.mongo.db').createCollection('logs', {capped: true, size: bytes(c.log_collection_cap)}, done)
    })
    tasks.push(function (done) {
      get('db.mongo.db').collection('thoughts').ensureIndex({app: 1, time: 1, key: 1}, done)
    })
    parallel(tasks, cb)
  }
}