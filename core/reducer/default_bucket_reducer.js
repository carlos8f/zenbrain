module.exports = function container (get, set, clear) {
  return function bucket_reducer (g, cb) {
    //get('logger').info('bucket_reducer', g.bucket.id)
    var bucket = g.bucket, tick = g.tick
    // just migrate data over
    tick.data = bucket.data
    cb()
  }
}