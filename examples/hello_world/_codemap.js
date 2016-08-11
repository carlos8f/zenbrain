module.exports = {
  _ns: 'zenbrain',
  'action_handlers[]': require('./action_handler'),
  'learners[]': require('./learner'),
  'mappers[]': require('./mapper'),
  'reducers[]': require('./reducer'),
  'reporters[]': require('./reporter'),
  'thought_reducers[]': require('./thought_reducer'),
  'tick_reducers[]': require('./tick_reducer')
}