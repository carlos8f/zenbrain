var assert = require('assert')

module.exports = function container (get, set, clear) {
  var get_id = get('utils.get_id')
  return function atomic_update (coll, id, updater, cb, backoff) {
    var c = get('config')
    var returned = false
    setTimeout(function () {
      if (!returned) {
        console.error('atomic update did not return', coll, id, backoff)
      }
    }, c.return_timeout)
    ////get('logger').info('atomic_update', coll, id, backoff)
    if (!backoff) {
      backoff = c.lock_backoff
    }
    var start = new Date().getTime()
    get('locks').load(coll + ':' + id, function (err, lock) {
      if (err) return cb(err)
      if (lock) {
        if (lock.time < new Date().getTime() - c.lock_timeout) {
          // break the lock
          //get('logger').info('atomic_update', lock.id, 'breaking lock'.red)
          get('locks').destroy(lock.id, function () {
            //get('logger').info('atomic_update', 'retry lock'.red)
            atomic_update(coll, id, updater, cb)
          })
        }
        else {
          //get('logger').info('atomic_update', lock.id, 'locked'.red)
          setTimeout(function () {
            atomic_update(coll, id, updater, cb, backoff * 2)
          }, backoff)
        }
      }
      else {
        lock = {
          id: coll + ':' + id
        }
        withLock()
      }
      function withLock () {
        var actual_cb = cb
        cb = function (err, result) {
          //get('logger').info('atomic_update', lock.id, ('destroying lock')[err ? 'red' : 'green'])
          get('locks').destroy(lock.id, function (err2) {
            if (err2) {
              console.error('atomic update err', err2)
            }
            //get('logger').info('atomic_update', lock.id, 'returning'.green, !!result)
            setImmediate(function () {
              actual_cb(err, result)
            })
          })
        }
        lock.time = new Date().getTime()
        var my_nonce = get_id()
        var tries = c.lock_tries
        function tryLock (backoff) {
          if (!backoff) {
            backoff = c.lock_backoff
          }
          lock.nonce = my_nonce
          //get('logger').info('atomic_update', lock.id, 'try'.grey)
          get('db').collection('locks').update({_id: lock.id}, {$set: lock}, {upsert: true}, function (err, result) {
            if (err && err.code === 11000) {
              // dupe id
              //get('logger').info('atomic_update', lock.id, 'dupe id'.red)
              if (!--tries) {
                return actual_cb(new Error('lock broken: ' + (lock && lock.id)))
              }
              return setTimeout(function () {
                tryLock(backoff * 2)
              }, backoff)
            }
            if (err) return cb(err)
            assert(result.result.n)
            //get('logger').info('atomic_update', lock.id, 'got lock'.green)
            get('locks').load(lock.id, function (err, locked) {
              if (err) return cb(err)
              if (!locked || locked.nonce !== my_nonce) {
                //get('logger').info('atomic_update', lock.id, 'broken'.red)
                if (!--tries) {
                  return actual_cb(new Error('lock broken: ' + lock.id))
                }
                return setTimeout(function () {
                  tryLock(backoff * 2)
                }, backoff)
              }
              //get('logger').info('atomic_update', coll, id, lock.id, 'loading'.green)
              get(coll).load(id, function (err, obj) {
                if (err) return cb(err)
                //get('logger').info('atomic_update', lock.id, 'updating'.green)
                updater(obj, function (err, updated) {
                  if (err) return cb(err)
                  assert(updated)
                  //get('logger').info('atomic_update', lock.id, 'saving'.green)
                  get(coll).save(updated, function (err, saved) {
                    if (err) return cb(err)
                    get('logger').info('atomic_update', lock.id, c.lock_tries - tries, new Date().getTime() - start, 'ms')
                    //get('logger').info('atomic_update', lock.id, 'saved'.green)
                    returned = true
                    cb(null, saved)
                  })
                })
              })
            })
          })
        }
        tryLock()
      }
    })
  }
}