module.exports = {
  _ns: 'zenbrain',
  'commands.launch': require('./launch.json'),
  'commands.map': require('./map.json'),
  'commands.reduce': require('./reduce.json'),
  'commands.run': require('./run.json'),
  'commands.scan': require('./scan.json'),
  'commands.sim': require('./sim.json'),
  'commands[]': [
    '#commands.launch',
    '#commands.map',
    '#commands.reduce',
    '#commands.run',
    '#commands.scan',
    '#commands.sim'
  ]
}