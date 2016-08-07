var assert = require('assert')
  , parallel = require('run-parallel-limit')
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
    setTimeout(function () {
      var keys = Object.keys(items)
      //get('logger').info('passive_update tasks', keys.length, outstanding)
      if (!keys.length) {
        queued = false
        return
      }
      var tasks = keys.map(function (tick_id) {
        var item = items[tick_id]
        return function (done) {
          var returned = false
          setTimeout(function () {
            if (!returned) {
              console.error('passive update did not return', item.id)
            }
            delete items[tick_id]
          }, c.return_timeout)
          get('ticks').load(tick_id, function (err, tick) {
            if (err) return done(err)
            if (!tick) {
              tick = item.defaults
            }
            //get('logger').info('passive_update', item.coll, item.id, 'updating'.green, item.updaters.length)
            var start = new Date().getTime()
            if (tick.prev_size) {
              var time_bucket = tb(tick.time).resize(tick.size)
              get('ticks').select({
                app: app_name,
                size: tick.prev_size,
                time: {
                  $gte: time_bucket.toMilliseconds(),
                  $lt: time_bucket.add(1).toMilliseconds()
                }
              }, function (err, sub_ticks) {
                if (err) return done(err)
                tick.queue = sub_ticks
                //console.error('queue', tick.id, tick.prev_size, sub_ticks.length)
                //console.error('sub_ticks', sub_ticks.length)
                withQueue()
              })
            }
            else {
              withQueue()
            }

            function withQueue () {
              apply_funcs(tick, item.updaters, function (err, tick) {
                if (err) return done(err)
                assert(tick)
                var before = new Date().getTime()
                //console.error('ran updaters', tick.id)
                if (!tick.prev_size) {
                  tick.queue.forEach(function (thought, idx) {
                    if (tick.thought_ids.indexOf(thought.id) !== -1) {
                      //console.error('dupe', thought.id, tick.thought_ids.length)
                      tick.queue.splice(idx, 1)
                      return
                    }
                    tick.thought_ids.push(thought.id)
                  })
                  //console.error('new', new_thoughts)
                  if (!tick.queue.length) {
                    returned = true
                    delete items[tick_id]
                    outstanding -= item.count
                    return done()
                  }
                  //console.error('new thoughts', new_thoughts)
                  apply_funcs(tick, get('thought_reducers'), function (err, tick) {
                    if (err) return done(err)
                    delete tick.queue
                    withReducers()
                  })
                }
                else {
                  var start = new Date().getTime()
                  //console.error('reducing tick', tick.id)
                  apply_funcs(tick, get('tick_reducers'), function (err, tick) {
                    if (err) return done(err)
                    delete tick.queue
                    //console.error('tick reduced', tick.id, new Date().getTime() - start, 'ms')
                    withReducers()
                  })
                }
                function withReducers () {
                  get('ticks').save(tick, function (err, saved) {
                    item.callbacks.forEach(function (cb) {
                      setImmediate(function () {
                        cb(err, saved)
                      })
                    })
                    returned = true
                    outstanding -= item.count
                    //get('logger').info('passive_update updaters ran', saved.id, item.count)
                    delete items[tick_id]
                    done()
                  })
                }
              })
            }
          })
        }
      })
      parallel(tasks, c.parallel_limit, function (err) {
        if (err) throw err
        //console.error('passive_update complete', keys)
        queued = false
        if (outstanding) {
          queueNext()
        }
      })
    }, c.passive_update_timeout)
  }
  return function passive_update (tick_id, defaults, updater, cb) {
    tick_id = app_name + ':' + tick_id
    //get('logger').info('passive_update', coll, id)
    if (!items[tick_id]) {
      items[tick_id] = {
        updaters: [],
        callbacks: [],
        defaults: defaults,
        count: 0
      }
    }
    else {
      //console.error('passive update group', items[coll + ':' + id].updaters.length)
    }
    if (updater) {
      items[tick_id].updaters.push(updater)
    }
    if (cb) {
      items[tick_id].callbacks.push(cb)
    }
    items[tick_id].count++
    outstanding++
    queueNext()
  }
}