var spawn = require('child_process').spawn
  , path = require('path')

module.exports = function container (get, set, clear) {
  return function launch () {
    var args = get('args')
    var options = get('options')
    args = args.filter(function (arg) {
      return !!arg
    })
    if (args.length !== 1 || !args[0]) throw new Error('must provide one or more cmds')
    var cmds = args[0]
    var latch = 0
    var commands = {}
    get('commands').forEach(function (command) {
      commands[command.name] = command
    })
    cmds.forEach(function (cmd) {
      var command = commands[cmd]
      if (!command) throw new Error('command not found: ' + cmd)
      var sub_args = [cmd]
      if (options.parent.config) {
        sub_args.push('--config', options.parent.config)
      }
      ;(command.options || []).forEach(function (option) {
        if (typeof options[option.name] !== 'undefined') {
          sub_args.push('--' + option.name)
          if (options[option.name] !== 'undefined') {
            sub_args.push(options[option.name])
          }
        }
      })
      ;(function respawn () {
        var proc = spawn(process.argv[1], sub_args, {stdio: 'inherit'})
        proc.once('close', function (code) {
          if (code) {
            get('logger').info('launcher', 'cmd `' + cmd + '` exited with code ' + code + ', respawning now.')
            respawn()
          }
        })
      })()
    })
  }
}