var extractor = require('unfluff')
  , colors = require('colors')
  , z = require('zero-fill')
  , parseUrl = require('url').parse
  , rp = require('rightpad')

module.exports = function container (get, set, clear) {
  //console.error("outside")
  return function reducer (t, cb) {
    var c = get('config')
    //console.error('reducing', t.tick.id)
    var rs = get('run_state')
    var tick = t.tick
    t.thoughts.forEach(function (thought) {
      delete thought.root
      if (thought.value.url) {
        try {
          thought.url = parseUrl(thought.value.url, true)
        }
        catch (e) {}
      }
      //console.error('thought', thought.value.headers)
      if (thought.value.body && thought.value.headers['content-type'] && thought.value.headers['content-type'].match(/^text\/html/)) {
        if (thought.value.url.match(/wikipedia/)) {
          //return
        }
        var meta = extractor(thought.value.body, 'en')
        if (meta && meta.title) {
          Object.keys(meta).forEach(function (k) {
            if (typeof meta[k] === 'undefined') {
              meta[k] = null
            }
          })
          thought.meta = meta
          var parsedUrl = parseUrl(thought.value.url)
          var out_url = parsedUrl.protocol.grey + '//'.grey + parsedUrl.host.cyan + parsedUrl.path.grey
          get('logger').info('reducer', z(80, thought.meta.title.white, ' '), rp(out_url, 80), (thought.meta.description || '').substring(0, 30).grey, {feed: 'reducer'})
          delete thought.value.body
        }
      }
    })
    setImmediate(cb)
  }
}