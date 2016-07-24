module.exports = {
  _ns: 'zenbrain',
  'reducer.merge_tick': require('./merge_tick'),
  'reducer.process_thoughts': require('./process_thoughts'),
  reducer: require('./reducer')
}