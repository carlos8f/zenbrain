module.exports = {
  _ns: 'motley',
  _maps: [
    require('motley-mongo'),
    require('./conf/_codemap'),
    require('./db/_codemap'),
    require('./hooks/_codemap')
  ]
}