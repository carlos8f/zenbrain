module.exports = {
  _ns: 'motley',
  _folder: 'db',
  helloworld_messages: require('./messages'),
  'collections[]': [
    '#db.helloworld_messages'
  ]
}