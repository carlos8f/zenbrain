var parallel = require('run-parallel')
  , tb = require('timebucket')
  , series = require('run-series')
  , xdiff = require('xdiff')

module.exports = function container (get, set, clear) {
  var tick_defaults = get('tick_defaults')
  return function scanner (cb) {
    var c = get('config')
    var tasks = c.reducer_sizes.map(function (size) {
      return function (done) {
        get('ticks').select({
          query: {
            app: get('app_name'),
            size: size,
            processed: false
          },
          limit: 1,
          sort: {
            time: 1
          }
        }, function (err, unprocessed_ticks) {
          if (err) return done(err)
          // all ticks in this size processed
          if (!unprocessed_ticks.length) return done()
          // found earliest unprocessed tick in the size.
          var g = {
            first_tick: unprocessed_ticks.pop()
          }
          g.current_tick = g.first_tick
          var bucket = tb(g.first_tick.time).resize(size)
          // scan back one to get one item of history.
          get('ticks').select({
            query: {
              app: get('app_name'),
              size: size,
              time: {
                $lt: g.first_tick.time
              }
            },
            limit: 1,
            sort: {
              time: -1
            }
          }, function (err, history_ticks) {
            if (err) return done(err)
            g.last_tick = history_ticks.pop()
            // run first tick
            apply_funcs(g, get('scanners'), function (err, g) {
              if (err) return done(err)
              passive_update('ticks', g.current_tick.id, g.current_tick, function (tick, update_done) {

                tick.processed = true
                update_done(null, tick)
              })
              // scan forward, filling in missing ticks
              // run callbacks in sequence until we reach the present
              ;(function scan () {
                get('ticks').select({
                  query: {
                    app: get('app_name'),
                    size: size,
                    time: {
                      $gt: g.current_tick.time
                    }
                  },
                  limit: c.scanner_limit,
                  sort: {
                    time: 1
                  }
                }, function (err, scan_ticks) {
                  if (err) return done(err)
                  if (!scan_ticks.length) {
                    // update ticks > first_tick, processed = true
                    return done()
                  }
                  var idx = 0
                  var sub_tasks = []
                  var next_tick
                  while (true) {
                    next_tick = scan_ticks[idx]
                    ;(function () {
                      var gg = {
                        last_tick: g.last_tick
                      }
                      g.last_tick = g.current_tick
                      g.current_tick = 
                      if (!tick) break
                      g.bucket.add(1)
                    })
                  }
                    
                    
                    var missing_tick
                    while (nt < tick.time) {
                      // missing tick. fill in
                      last_tick = missing_tick
                      missing_tick = tick_defaults(g.bucket.toString(), size)
                      passive_update('ticks', missing_tick.id, missing_tick, function (tick, update_done) {
                        var gg = {
                          first_tick: g.first_tick,
                          current_tick: tick,
                          last_tick: missing_tick
                        }
                      })
                      g.bucket.add(1)
                      nt = g.bucket.toMilliseconds()
                    }
                    passive_update('ticks', tick.id, tick, updater)
                  }

                })
              })()
            })
          })
        })
      }
    })
    parallel(tasks, cb)
  }
}