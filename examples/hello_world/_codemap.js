module.exports = {
  _ns: 'zenbrain',
  'action_handlers[]': require('./action_handler'),
  'learners[]': require('./learner'),
  'mappers[]': require('./mapper'),
  'reporters[]': require('./reporter'),
  'thought_reducers[]': require('./message_reducer'),
  'tick_reducers[]': require('./tick_reducer')
}