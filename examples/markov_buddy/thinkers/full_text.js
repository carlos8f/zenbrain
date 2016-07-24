module.exports = function container (get, set, clear) {
  return function thinker (tick, cb) {
    var rs = get('run_state')
    rs.full_text || (rs.full_text = '')
    rs.full_text += tick.messages.join(' ') + '\n'
    get('launcher.save_state')(cb)
  }
}