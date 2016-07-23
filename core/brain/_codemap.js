module.exports = {
  _ns: 'zenbrain',
  brain: require('./brain'),
  tick_handlers: [require('./tick_handler')],
  thinkers: [],
  reporters: []
}