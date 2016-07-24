var markov = require('markov')

module.exports = function container (get, set, clear) {
  var map = get('map')
  var m = markov(1)
  return function chat () {
    get('run_states').load('run', function (err, run_run_state) {
      if (err) throw err
      var full_text = run_run_state && run_run_state.full_text || ' '
      m.seed(Buffer(full_text), function () {
        var stdin = process.openStdin()
        process.stderr.write('> ')
        stdin.on('data', function (line) {
          var text = line.toString()
          map('message', {text: text})
          var resp = m.respond(text).join(' ')
          map('message', {text: resp})
          process.stderr.write('> ')
        })
      })
    })
  }
}