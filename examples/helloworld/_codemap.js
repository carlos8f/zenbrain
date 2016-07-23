module.exports = {
  _ns: 'zenbrain',
  _maps: [
    require('./actions/_codemap'),
    require('./commands/_codemap'),
    require('./db/_codemap'),
    require('./mappers/_codemap'),
    require('./reducers/_codemap'),
    require('./reporters/_codemap')
  ]
}