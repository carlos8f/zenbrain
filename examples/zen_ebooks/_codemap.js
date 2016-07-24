module.exports = {
  _ns: 'zenbrain',
  _maps: [
    require('./db/_codemap'),
    require('./mappers/_codemap'),
    require('./reducers/_codemap'),
    require('./reporters/_codemap'),
    require('./thinkers/_codemap')
  ]
}