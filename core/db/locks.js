module.exports = function container (get, set) {
  return get('db.createCollection')('locks')
}