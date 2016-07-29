var parallel = require('run-parallel-limit')

module.exports = function container (get, set, clear) {
  var c = get('config')
  return function status (options) {
    var ret = {
      thoughts: 0,
      ticks: 0,
      logs: 0
    }
    var tasks = []
    Object.keys(ret).forEach(function (k) {
      tasks.push(function (done) {
        get('db').collection(k).count({app_name: get('app_name')}, function (err, result) {
          if (err) return done(err)
          ret[k] = result
          done()
        })
      })
    })
    parallel(tasks, c.parallel_limit, function (err) {
      if (err) throw err
      get('logger').info('status', ret, {feed: 'status'})
      get('app').close(function () {
        process.exit()
      })
    })
  }
}