var n = require('numbro')
  , tb = require('timebucket')
  , path = require('path')

module.exports = function container (get, set, clear) {
  
  var app = get('app')
  return function launcher (action) {
    return function () {
      var args = [].slice.call(arguments)
      var options = args.pop()
      set('args', args)
      set('options', options)
      var c = get('config')
      if (options.parent.config) {
        try {
          var more_config = require(path.resolve(process.cwd(), options.parent.config))
        }
        catch (e) {
          if (e.code === 'MODULE_NOT_FOUND') {
            throw new Error('No config found. Please copy config_sample.js to ' + options.parent.config + ', edit, and re-try.')
          }
          throw e
        }
        Object.keys(more_config).forEach(function (k) {
          c[k] = more_config[k]
        })
        set('@config', c)
      }
      if (get.exists('setup.' + get('command'))) {
        get('setup.' + get('command'))()
      }
      app.mount(function (err) {
        if (err) throw err
        function onExit () {
          app.closing = true
          get('logger').info('launcher', 'cmd `'.grey + get('command') + '` exiting'.grey)
          setTimeout(function () {
            process.exit()
          }, 5000)
          process.on('uncaughtException', function (err) {
            process.exit()
          })
          app.close(function (err) {
            process.exit()
          })
        }
        process.once('SIGINT', onExit)
        process.once('SIGTERM', onExit)
        var run_state_id = get('app_name') + '_' + get('command')
        get('logger').info('launcher', 'cmd `'.grey + get('command') + '` booting'.grey)
        get('run_states').load(run_state_id, function (err, run_state) {
          if (err) throw err
          run_state || (run_state = {
            id: run_state_id,
            time: new Date().getTime(),
            total_us: 0
          })
          run_state.start_us = tb('µs').value
          set('run_state', run_state)
          Object.keys(run_state).forEach(function (k) {
            var val = run_state[k]
            if (typeof val === 'number') {
              val = n(val).format('0').white
            }
            else if (typeof val === 'string') {
              val = ('"' + val + '"').green
            }
          })
          var save_interval = setInterval(get('launcher.save_state'), c.save_state_interval)
          set('intervals[]', save_interval)
          action()
        })
      })
    }
  }
}