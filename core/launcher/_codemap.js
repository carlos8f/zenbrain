module.exports = {
  _ns: 'zenbrain',
  'launcher': require('./launcher'),
  'launcher.save_state': require('./save_state'),
  'motley:hooks.close[-1]': '#zenbrain:launcher.save_state'
}