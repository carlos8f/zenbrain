module.exports = {
  _ns: 'zenbrain',
  'mappers[]': require('./mapper'),
  'reducers.crawler': require('./reducer'),
  'reducers[]': '#reducers.crawler'
}