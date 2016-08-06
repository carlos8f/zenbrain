var assert = require('assert')
  , parallel = require('run-parallel')

module.exports = function container (get, set, clear) {
  var c = get('config')
  var get_id = get('utils.get_id')
  var apply_funcs = get('utils.apply_funcs')
  var atomic_update = get('utils.atomic_update')
  var items = {}
  var outstanding = 0
  var queued = false
  function queueNext () {
    if (queued) return
    queued = true
    setTimeout(function () {
      var keys = Object.keys(items)
      //get('logger').info('passive_update tasks', keys.length, outstanding)
      if (!keys.length) {
        queued = false
        return
      }
      var tasks = keys.map(function (k) {
        var item = items[k]
        return function (done) {
          delete items[k]
          var returned = false
          setTimeout(function () {
            if (!returned) {
              console.error('passive update did not return', item.coll, item.id)
            }
          }, c.return_timeout)
          get(item.coll).load(item.id, function (err, obj) {
            if (err) throw err
            //get('logger').info('passive_update', item.coll, item.id, 'updating'.green, item.updaters.length)
            apply_funcs(obj, item.updaters, function (err, updated) {
              if (err) throw err
              assert(updated)
              get(item.coll).save(updated, function (err, saved) {
                item.callbacks.forEach(function (cb) {
                  setImmediate(function () {
                    cb(err, saved)
                  })
                })
                returned = true
                outstanding -= item.updaters.length
                //get('logger').info('passive_update updaters ran', saved.id, item.updaters.length)
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
          queueNext()
        }
      })
    }, c.passive_update_timeout)
  }
  return function passive_update (coll, id, updater, cb) {
    //get('logger').info('passive_update', coll, id)
    if (!items[coll + ':' + id]) {
      items[coll + ':' + id] = {
        coll: coll,
        id: id,
        updaters: [],
        callbacks: []
      }
    }
    else {
      //console.error('passive update group', items[coll + ':' + id].updaters.length)
    }
    items[coll + ':' + id].updaters.push(updater)
    if (cb) {
      items[coll + ':' + id].callbacks.push(cb)
    }
    outstanding++
    queueNext()
  }
}