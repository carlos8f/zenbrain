var parallel = require('run-parallel')
  , tb = require('timebucket')
  , series = require('run-series')
  , xdiff = require('xdiff')

module.exports = function container (get, set, clear) {
  var tick_defaults = get('tick_defaults')
  var get_tick_str = get('utils.get_tick_str')
  var apply_funcs = get('utils.apply_funcs')
  var passive_update = get('utils.passive_update')
  var get_timestamp = get('utils.get_timestamp')
  // scanner: progressive forward scan +update of ticks after reduction
  return function scanner (cb) {
    var c = get('config')
    var rs = get('run_state')
    //get('logger').info('scanner', 'running'.grey)
    // for each reducer size, do a separate scan
    var tasks = c.reducer_sizes.map(function (size) {
      if (!rs[size]) {
        rs[size] = {}
      }
      var s = rs[size]
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
            //get('logger').info('scanner', 'no unprocessed ticks'.grey)
            return done()
          }
          // set up an env with
          // - `tick` being scanned
          // - `last_tick` scanned
          var start_tick = unprocessed_start.pop()
          s.first_time = s.first_time ? Math.min(s.first_time, start_tick.time) : start_tick.time
          s.scan_time = start_tick.time
          var scanned = []
          var first_tick_id = get('app_name') + ':' + tb(s.first_time).resize(size).toString()
          //get('logger').info('scanner', get_tick_str(first_tick_id), 'first tick'.grey)
          //get('logger').info('scanner', get_tick_str(start_tick.id), 'scan start'.grey)
          // scan back one to get one item of history.
          var history_bucket = tb(s.scan_time).resize(size).subtract(1)
          get('ticks').select({
            query: {
              app: get('app_name'),
              size: size,
              time: history_bucket.toMilliseconds()
            },
            limit: 1,
            sort: {
              time: -1
            }
          }, function (err, history_ticks) {
            if (err) return done(err)
            with_history(history_ticks)
          })
          function with_history (history_ticks) {
            var g = {}
            if (history_ticks.length) {
              // last tick from history query
              g.last_tick = history_ticks.pop()
            }
            else {
              // invent a tick
              g.last_tick = tick_defaults(history_bucket.toString(), size)
            }
            //get('logger').info('scanner', get_tick_str(g.last_tick.id), 'last tick'.grey)
            g.tick = start_tick
            scan_tick(g, function (err, g) {
              if (err) return done(err)
              s.scan_time = tb(s.scan_time).resize(size).add(1).toMilliseconds()
              scan_forward(g)
            })
          }
          function scan_tick (g, scan_done) {
            // record original for 3-way merge
            //get('logger').info('scanner', get_tick_str(g.tick.id), 'scanning', {feed: 'scanner'})
            var orig = JSON.parse(JSON.stringify(g.tick))
            apply_funcs(g, get('scanners'), function (err, g) {
              if (err) return scan_done(err)
              var mine = g.tick
              // update the processed flag
              mine.processed = true
              // defer the merge and continue
              passive_update('ticks', mine.id, mine, function (tick, update_done) {
                // merge passed-in tick with scan result
                //get('logger').info('scanner', get_tick_str(tick.id), 'updating', tick, {feed: 'scanner'})
                var diff = xdiff.diff3(mine, orig, tick) || []
                var merged = xdiff.patch(orig, diff)
                update_done(null, merged)
              }, function (err, tick) {
                if (err) throw err
                //get('logger').info('scanner', get_tick_str(tick.id), 'scanned', tick, {feed: 'scanner'})
              })
              scanned.push(mine.id)
              scan_done(null, g)
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
                    $gt: s.scan_time
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
                  while (s.scan_time <= now) {
                    (function (scan_time) {
                      var tick_id = tb(scan_time).resize(size).toString()
                      sub_tasks.push(function (sub_done) {
                        // fill in missing ticks
                        var missing_tick = tick_defaults(tick_id, size)
                        g.last_tick = g.tick
                        g.tick = missing_tick
                        scan_tick(g, sub_done)
                      })
                    })(s.scan_time)
                    s.scan_time = tb(s.scan_time).resize(size).add(1).toMilliseconds()
                  }
                  return series(sub_tasks, function (err) {
                    if (err) return done(err)
                    //get('logger').info('scanner', 'scanned', get_timestamp(tb(scanned[0]).toMilliseconds()), '->', get_timestamp(tb(scanned[scanned.length - 1]).toMilliseconds()), {feed: 'scanner'})
                    scanned = []
                    done()
                  })
                }
                var index = {}, max_time = 0
                scan_ticks.forEach(function (tick) {
                  index['time:' + tick.time] = tick
                  max_time = Math.max(max_time, tick.time)
                })
                with_index(index, max_time)
              })
              function with_index (index, max_time) {
                // scan_time is incremented after each scan
                // fill in missing ticks with default values
                var sub_tasks = []
                //console.error('index', index.length)
                while (s.scan_time <= max_time) {
                  // interpolate
                  (function (scan_time) {
                    var current_tick = index['time:' + scan_time]
                    if (!current_tick) {
                      current_tick = tick_defaults(tb(scan_time).resize(size).toString(), size)
                    }
                    sub_tasks.push(function (sub_done) {
                      g.last_tick = g.tick
                      g.tick = current_tick
                      scan_tick(g, sub_done)
                    })
                  })(s.scan_time)
                  s.scan_time = tb(s.scan_time).resize(size).add(1).toMilliseconds()
                }
                series(sub_tasks, scan)
              }
            })()
          }
        })
      }
    })
    parallel(tasks, cb)
  }
}