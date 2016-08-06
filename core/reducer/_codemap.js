module.exports = {
  _ns: 'zenbrain',
  bucket_to_tick: require('./bucket_to_tick'),
  tick_to_ticks: require('./tick_to_ticks'),
  thought_reducer: require('./thought_reducer'),
  //process_ticks: require('./process_ticks'),
  thoughts_to_buckets: require('./thoughts_to_buckets'),
  'reducers[]': [
    '#thought_reducer'
  ],
  default_bucket_reducer: require('./default_bucket_reducer'),
  'bucket_reducers[]': '#default_bucket_reducer'
}