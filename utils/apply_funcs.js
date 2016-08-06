module.exports = function container (get, set, clear) {
  return function apply_funcs (item, funcs, cb) {
    funcs = funcs.slice()
    ;(function doNext () {
      var curr = funcs.shift()
      if (!curr) return cb(null, item)
      curr(item, function (err, result) {
        if (err) return cb(err)
        if (typeof result !== 'undefined') {
          item = result
        }
        setImmediate(doNext)
      })
    })()
  }
}