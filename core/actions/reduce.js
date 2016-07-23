module.exports = function container (get, set, clear) {
  var do_reduce = get('reduce')
  var c = get('core.constants')
  return function reduce (options) {
    do_reduce(function (err, idle) {
      if (err) {
        get('logger').error('reduce err', err)
      }
      setTimeout(function () {
        reduce(options)
      }, idle ? c.brain_speed_ms : 0)
    })
  }
}