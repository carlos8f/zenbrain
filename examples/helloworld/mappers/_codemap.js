module.exports = {
  _ns: 'zenbrain',
  'mappers.message': require('./message_mapper'),
  'mappers[]': '#mappers.message'
}