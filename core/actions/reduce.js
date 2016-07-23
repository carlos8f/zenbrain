module.exports = function container (get, set, clear) {
  return function reduce (options) {
    var reducers = get('reducers')
    if (!reducers.length) throw new Error('no reducers found')
    reducers.forEach(function (reducer) {
      reducer(options)
    })
  }
}