module.exports = {
  _ns: 'zenbrain',
  merge_thoughts: require('./merge_thoughts'),
  merge_ticks: require('./merge_ticks'),
  process_thoughts: require('./process_thoughts'),
  process_ticks: require('./process_ticks'),
  thought_reducer: require('./thought_reducer'),
  tick_reducer: require('./tick_reducer'),
  'reducers[]': [
    '#thought_reducer',
    '#tick_reducer'
  ]
}