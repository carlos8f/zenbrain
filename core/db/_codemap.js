module.exports = {
  _ns: 'motley',
  _maps: [
    require('motley-mongo')
  ],
  'zenbrain:db': '#motley:db.mongo.db',
  'db.cache': require('./cache'),
  'db.logs': require('./logs'),
  'db.run_states': require('./run_states'),
  'db.thoughts': require('./thoughts'),
  'db.ticks': require('./ticks'),
  'zenbrain:cache': '#motley:db.cache',
  'zenbrain:logs': '#motley:db.logs',
  'zenbrain:run_states': '#motley:db.run_states',
  'zenbrain:thoughts': '#motley:db.thoughts',
  'zenbrain:ticks': '#motley:db.ticks',
  'db.collections[]': [
    '#db.cache',
    '#db.logs',
    '#db.run_states',
    '#db.thoughts',
    '#db.ticks'
  ],
  'zenbrain:db_hooks': [],
  'conf.db.mongo{}': function container (get, set, clear) {
    var config = get('zenbrain:config')
    return {
      url: config.mongo_url,
      username: config.mongo_username,
      password: config.mongo_password
    }
  },
  'hooks.mount[]': require('./on_mount')
}