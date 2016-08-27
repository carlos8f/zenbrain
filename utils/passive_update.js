var assert = require('assert')
  , parallel = require('run-parallel')
  , tb = require('timebucket')

module.exports = function container (get, set, clear) {
  var get_id = get('utils.get_id')
  var apply_funcs = get('utils.apply_funcs')
  var atomic_update = get('utils.atomic_update')
  var get_tick_str = get('utils.get_tick_str')
  var app_name = get('app_name')
  var items = {}
  var outstanding = 0
  var timeout
  function queueNext () {
    var c = get('config')
    if (timeout) return
    timeout = setTimeout(doNext, c.passive_update_timeout)
  }
  function doNext () {
    var c = get('config')
    clearTimeout(timeout)
    timeout = null
    var keys = Object.keys(items)
    //get('logger').info('batcher', outstanding, 'outstanding tick updates'.grey)
    if (!keys.length) {
      return
    }
    var tasks = keys.map(function (item_id) {
      var item = items[item_id]
      delete items[item_id]
      return function (done) {
        var returned = false
        setTimeout(function () {
          if (!returned) {
            //console.error('passive update did not return', item.id)
          }
        }, c.return_timeout)
        //get('logger').info('update load', get_tick_str(tb(item_id.split(':')[1]).resize('1h').toString()))
        get(item.coll).load(item_id, function (err, obj) {
          if (err) return done(err)
          if (item_id.indexOf('m') !== -1) {
            //get('logger').info('passive update', 'loaded'.grey, item_id, !!obj)
          }
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
              //get('logger').info('batcher', get_tick_str(saved.id), ('x' + item.updaters.length).grey, String(new Date().getTime() - start).grey, 'ms'.grey)
              done()
            })
          })
        })
      }
    })
    parallel(tasks, function (err) {
      if (err) throw err
    })
  }
  return function passive_update (coll, id, defaults, updater, cb) {
    //get('logger').info('add updater', get_tick_str(tb(id.split(':')[1]).resize('1h').toString()))
    if (id.indexOf(get('app_name')) !== 0) {
      id = get('app_name') + ':' + id
    }
    if (!items[id]) {
      items[id] = {
        coll: coll,
        id: id,
        updaters: [],
        callbacks: [],
        defaults: defaults,
        count: 0
      }
    }
    var i = items[id]
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