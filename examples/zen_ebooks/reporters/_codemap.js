module.exports = {
  _ns: 'zenbrain',
  'reporters.console': require('./console_reporter'),
  'reporters[]': '#reporters.console'
}