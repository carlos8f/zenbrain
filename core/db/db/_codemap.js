module.exports = {
  _ns: 'motley',
  _folder: 'db',
  'logs': require('./logs'),
  'run_states': require('./run_states'),
  'thoughts': require('./thoughts'),
  'ticks': require('./ticks'),
  'zenbrain:logs': '#motley:db.logs',
  'zenbrain:run_states': '#motley:db.run_states',
  'zenbrain:thoughts': '#motley:db.thoughts',
  'zenbrain:ticks': '#motley:db.ticks',
  'zenbrain:db': '#motley:db.mongo.db',
  'collections[]': [
    '#db.logs',
    '#db.run_states',
    '#db.ticks'
  ]
}