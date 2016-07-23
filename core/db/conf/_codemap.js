module.exports = {
  _ns: 'motley',
  _folder: 'conf',
  'db.mongo{}': function container (get, set, clear) {
    return get('zenbrain:core.config').mongo || {}
  }
}