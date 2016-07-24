var motley = require('motley')
var commander = require('commander')
var make_config = require('./utils/make_config')
var path = require('path')

module.exports = function zenbrain (p, name) {
  p = path.resolve(p)
  return {
    get_version: function () {
      try {
        return require(p + '/package.json').version
      }
      catch (e) {
        return '0.0.0'
      }
    },
    get_config: function () {
      var config = make_config(path.join(__dirname, 'config-core-sample.js'))
      try {
        var more_config = make_config(path.join(p, 'config-' + name + '-sample.js'))
        Object.keys(more_config).forEach(function (k) {
          config[k] = more_config[k]
        })
      }
      catch (e) {
        throw e
      }
      return config
    },
    get_codemaps: function () {
      return this.get_config().enabled_plugins.map(function (plugin) {
        var map
        try {
          map = require(path.join(p, plugin, '_codemap'))
        }
        catch (e) {
          if (e.code === 'MODULE_NOT_FOUND') {
            try {
              map = require('./' + plugin + '/_codemap')
            }
            catch (e) {
              throw e
              if (e.code === 'MODULE_NOT_FOUND') {
                throw new Error('plugin `' + plugin + '` could not be found.')
              }
              throw e
            }
          }
          else {
            throw e
          }
        }
        return map
      }).concat(require('./_codemap'), require(path.join(p, '_codemap')))
    },
    make_app: function () {
      return motley({
        _ns: 'zenbrain',
        _maps: this.get_codemaps(),
        root: p,
        'core.constants': require('./constants.json'),
        config: this.get_config()
      })
    },
    cli: function () {
      var app = this.make_app()
      app.set('zenbrain:app', app)
      var launcher = app.get('zenbrain:launcher')
      var program = require('commander')
        .version(this.get_version())
      app.set('zenbrain:program', program)
      var command = process.argv[2]
      app.set('zenbrain:command', command || null)
      var cmds = app.get('zenbrain:commands').map(function (command) {
        var cmd = program
          .command(command.spec)
          .description(command.description)
        ;(command.options || []).forEach(function (option) {
          cmd = cmd.option(option.spec, option.description, option.number ? Number : String, option.default)
        })
        var action = app.get('zenbrain:actions.' + (command.action || command.name))
        cmd.action(launcher(action))
        return command.name
      })
      if (!command || cmds.indexOf(command) === -1) {
        program.outputHelp()
        process.exit(1)
      }
      app.mount(function (err) {
        if (err) cb(err)
        function onExit () {
          app.closing = true
          process.on('uncaughtException', function (err) {
            // ignore
          })
          app.close(function (err) {
            process.exit()
          })
        }
        process.once('SIGINT', onExit)
        process.once('SIGTERM', onExit)
        program.parse(process.argv)
      })
    }
  }
}