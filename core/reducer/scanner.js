var parallel = require('run-parallel')
  , tb = require('timebucket')
  , series = require('run-series')
  , xdiff = require('xdiff')

module.exports = function container (get, set, clear) {
  var tick_defaults = get('tick_defaults')
  var get_tick_str = get('utils.get_tick_str')
  // scanner: progressive forward scan +update of ticks after reduction
  return function scanner (cb) {
    var c = get('config')
    get('logger').info('scanner', 'running'.grey)
    // for each reducer size, do a separate scan
    var tasks = c.reducer_sizes.map(function (size) {
      return function (done) {
        // find the earliest unprocessed tick in this size.
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
        }, function (err, unprocessed_start) {
          if (err) return done(err)
          // all ticks in this size processed
          if (!unprocessed_start.length) {
            get('logger').info('scanner', 'no unprocessed ticks'.grey)
            return done()
          }
          // set up an env with
          // - first_tick in scan
          // - last_tick in scan
          // - current_tick being scanned
          var g = {
            first_tick: unprocessed_start.pop()
          }
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
            with_history(history_ticks)
          })
        })
        function scan_tick (g, scan_done) {
          // record original for 3-way merge
          var orig = JSON.parse(JSON.stringify(g.current_tick))
          apply_funcs(g, get('scanners'), function (err, g) {
            if (err) return scan_done(err)
            var mine = g.current_tick
            // update the processed flag
            mine.processed = true
            // defer the merge and continue
            passive_update('ticks', mine.id, mine, function (tick, update_done) {
              // merge passed-in tick with scan result
              var diff = xdiff.diff3(mine, orig, tick)
              var merged = xdiff.patch(orig, diff)
              get('logger').info('scanner', get_tick_str(tick.id))
              update_done(null, merged)
            })
            scan_done(null, g)
          })
        }
        function with_history (history_ticks) {
          // run first tick
          g.last_tick = history_ticks.pop()
          g.current_tick = g.first_tick
          scan_tick(g, function (err, g) {
            if (err) return done(err)
            bucket.add(1)
            scan_forward(g)
          })
        }
        function scan_forward (g) {
          // scan forward, filling in missing ticks
          // run callbacks in sequence until we reach the present
          ;(function scan (err) {
            if (err) return done(err)
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
                // fill in final gap to the present
                var sub_tasks = [], now = new Date().getTime()
                while (next_time <= now) {
                  sub_tasks.push(function (sub_done) {
                    // fill in missing ticks
                    var missing_tick = tick_defaults(next_time, size)
                    g.last_tick = g.current_tick
                    g.current_tick = missing_tick
                    scan_tick(g, sub_done)
                  })
                  bucket.add(1)
                  next_time = bucket.toMilliseconds()
                }
                return series(sub_tasks, cb)
              }
              with_scan_ticks(scan_ticks)
            })
            function with_scan_ticks (scan_ticks) {
              // bucket is incremented after each scan
              // fill in missing ticks with default values
              var next_time = bucket.toMilliseconds()
              var sub_tasks = []
              scan_ticks.forEach(function (current_tick) {
                while (next_time < current_tick.time) {
                  sub_tasks.push(function (sub_done) {
                    // fill in missing ticks
                    var missing_tick = tick_defaults(next_time, size)
                    g.last_tick = g.current_tick
                    g.current_tick = missing_tick
                    scan_tick(g, sub_done)
                  })
                  bucket.add(1)
                  next_time = bucket.toMilliseconds()
                }
                sub_tasks.push(function (sub_done) {
                  // scan tick
                  g.last_tick = g.current_tick
                  g.current_tick = current_tick
                  scan_tick(g, sub_done)
                })
                bucket.add(1)
                next_time = bucket.toMilliseconds()
              })
              series(sub_tasks, scan)
            }
          })()
        }
      }
    })
    parallel(tasks, cb)
  }
}