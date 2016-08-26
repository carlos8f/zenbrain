var parallel = require('run-parallel')
  , tb = require('timebucket')
  , series = require('run-series')
  , xdiff = require('xdiff')

module.exports = function container (get, set, clear) {
  var tick_defaults = get('tick_defaults')
  var get_tick_str = get('utils.get_tick_str')
  var apply_funcs = get('utils.apply_funcs')
  var passive_update = get('utils.passive_update')
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
          s.first_time = unprocessed_start.pop().time
          s.bucket = tb(s.first_time).resize(size)
          get('logger').info('scanner', get_tick_str(s.bucket.toString()), 'first tick'.grey)
          // scan back one to get one item of history.
          get('ticks').select({
            query: {
              app: get('app_name'),
              size: size,
              time: tb(s.bucket.toString()).subtract(1).toMilliseconds()
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
        function with_history (g, history_ticks) {
          if (history_ticks.length) {
            g.last_tick = history_ticks.pop()
          }
          else {
            // invent a tick
            g.last_tick = tick_defaults(tb(g.bucket.toString()).subtract(1).toString(), size)
          }
          get('logger').info('scanner', g.last_tick ? get_tick_str(g.last_tick.id) : 'null'.grey, 'last tick'.grey)
          g.current_tick = g.first_tick
          scan_tick(g, function (err, g) {
            if (err) return done(err)
            scan_forward(g)
          })
        }
        function scan_tick (scan_done) {
          // record original for 3-way merge
          get('logger').info('scanner', get_tick_str(current_tick.id), 'scanning', {feed: 'scanner'})
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
              get('logger').info('scanner', get_tick_str(tick.id), 'scanned', merged, {feed: 'scanner'})
              update_done(null, merged)
            })
            scan_done(null, g)
          })
        }
        function scan_forward (g) {
          // scan forward, filling in missing ticks
          // run callbacks in sequence until we reach the present
          var next_time = tb(g.current_tick.toString()).add(1).toMilliseconds()
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
                  var next_id = tb(next_time).resize(size).toString()
                  sub_tasks.push(function (sub_done) {
                    // fill in missing ticks
                    var missing_tick = tick_defaults(next_id, size)
                    g.last_tick = g.current_tick
                    g.current_tick = missing_tick
                    scan_tick(g, sub_done)
                  })
                  g.bucket.add(1)
                  next_time = g.bucket.toMilliseconds()
                }
                get('logger').info('scanner', 'end of ticks, synthesizing final'.grey, String(sub_tasks.length).grey, 'ticks.'.grey)
                return series(sub_tasks, cb)
              }
              with_scan_ticks(scan_ticks)
            })
            function with_scan_ticks (scan_ticks) {
              // bucket is incremented after each scan
              // fill in missing ticks with default values
              next_time = g.bucket.toMilliseconds()
              var sub_tasks = []
              scan_ticks.forEach(function (current_tick) {
                while (next_time < current_tick.time) {
                  var next_id = tb(next_time).resize(size).toString()
                  sub_tasks.push(function (sub_done) {
                    // fill in missing ticks
                    var missing_tick = tick_defaults(next_id, size)
                    g.last_tick = g.current_tick
                    g.current_tick = missing_tick
                    scan_tick(g, sub_done)
                  })
                  g.bucket.add(1)
                  next_time = g.bucket.toMilliseconds()
                }
                sub_tasks.push(function (sub_done) {
                  // scan tick
                  g.last_tick = g.current_tick
                  g.current_tick = current_tick
                  scan_tick(g, sub_done)
                })
                g.bucket.add(1)
                next_time = g.bucket.toMilliseconds()
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