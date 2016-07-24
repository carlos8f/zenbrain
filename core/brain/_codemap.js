module.exports = {
  _ns: 'zenbrain',
  runner: require('./runner'),
  'tick_handlers.apply_thinkers': require('./apply_thinkers'),
  tick_handlers: [
    '#tick_handlers.apply_thinkers'
  ],
  thinkers: [],
  reporters: []
}