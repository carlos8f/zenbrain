module.exports = {
  _ns: 'zenbrain',
  scanner: require('./scanner'),
  tick_to_ticks: require('./tick_to_ticks'),
  thought_reducer: require('./thought_reducer'),
  thoughts_to_tick: require('./thoughts_to_tick'),
  'reducers[]': [
    '#thought_reducer',
    '#scanner'
  ],
  tick_defaults: require('./tick_defaults'),
  tick_reducers: [],
  thought_reducers: [],
  scanners: []
}