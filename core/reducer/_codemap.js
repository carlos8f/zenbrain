module.exports = {
  _ns: 'zenbrain',
  tick_to_ticks: require('./tick_to_ticks'),
  thought_reducer: require('./thought_reducer'),
  thoughts_to_tick: require('./thoughts_to_tick'),
  'reducers[]': [
    '#thought_reducer'
  ],
  tick_reducers: [],
  thought_reducers: []
}