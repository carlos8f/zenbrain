var assert = require('assert')
  , parallel = require('run-parallel')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var get_id = get('utils.get_id')
  var apply_funcs = get('utils.apply_funcs')
  var atomic_update = get('utils.atomic_update')
  var app_name = get('app_name')
  var items = {}
  var outstanding = 0
  var queued = false
  function queueNext () {
    if (queued) return
    queued = true
    setTimeout(doNext, c.passive_update_timeout)
  }
  function doNext () {
    var keys = Object.keys(items)
    //get('logger').info('passive_update tasks', outstanding)
    if (!keys.length) {
      queued = false
      return
    }
    var tasks = keys.map(function (item_id) {
      var item = items[item_id]
      delete items[item_id]
      return function (done) {
        var returned = false
        setTimeout(function () {
          if (!returned) {
            console.error('passive update did not return', item.id)
          }
        }, c.return_timeout)
        get(item.coll).load(item.id, function (err, obj) {
          if (err) return done(err)
          if (!obj) {
            obj = item.defaults
          }
          //get('logger').info('passive_update', item.coll, item.id, 'updating'.green, item.updaters.length)
          var start = new Date().getTime()
          apply_funcs(obj, item.updaters, function (err, obj) {
            if (err) return done(err)
            assert(obj)
            get(item.coll).save(obj, function (err, saved) {
              item.callbacks.forEach(function (cb) {
                setImmediate(function () {
                  cb(err, saved)
                })
              })
              returned = true
              outstanding -= item.count
              //get('logger').info('passive_update', saved.id.grey, 'x' + item.count, new Date().getTime() - start, 'ms')
              done()
            })
          })
        })
      }
    })
    parallel(tasks, function (err) {
      if (err) throw err
      //console.error('passive_update complete', keys)
      queued = false
      if (outstanding) {
        doNext()
      }
    })
  }
  return function passive_update (coll, id, defaults, updater, cb) {
    //get('logger').info('passive_update', coll, id)
    var item_id = coll + ':' + id
    if (!items[item_id]) {
      items[item_id] = {
        coll: coll,
        id: id,
        updaters: [],
        callbacks: [],
        defaults: defaults,
        count: 0
      }
    }
    var i = items[item_id]
    if (updater) {
      i.updaters.push(updater)
    }
    if (cb) {
      i.callbacks.push(cb)
    }
    i.count++
    outstanding++
    queueNext()
  }
}