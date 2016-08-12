module.exports = function container (get, set, clear) {
  return function apply_funcs () {
    var apply_args = [].slice.call(arguments)
    var cb = apply_args.pop(), funcs = apply_args.pop()
    funcs = funcs.slice()
    var result = [null]
    ;(function doNext () {
      var curr = funcs.shift()
      if (!curr) return cb.apply(null, [null].concat(apply_args))
      curr.apply(null, apply_args.concat(function () {
        var return_args = [].slice.call(arguments)
        var err = return_args.shift()
        if (err) return cb(err)
        return_args.forEach(function (arg, idx) {
          apply_args[idx] = arg
        })
        doNext()
      }))
    })()
  }
}