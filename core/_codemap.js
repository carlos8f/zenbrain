module.exports = {
  _ns: 'zenbrain',
  _maps: [
    require('./actions/_codemap'),
    require('./commands/_codemap'),
    require('./db/_codemap'),
    require('./launcher/_codemap'),
    require('./logger/_codemap'),
    require('./mapper/_codemap'),
    require('./reducer/_codemap'),
    require('./runner/_codemap')
  ]
}