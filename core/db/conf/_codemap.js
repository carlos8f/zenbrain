module.exports = {
  _ns: 'motley',
  _folder: 'conf',
  'db.mongo{}': function container (get, set, clear) {
    return get('zenbot:core.config').mongo || {}
  }
}