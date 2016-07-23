var fs = require('fs')

module.exports = {
  _ns: 'zenbrain',
  _maps: [
    require('./actions/_codemap'),
    require('./brain/_codemap'),
    require('./commands/_codemap'),
    require('./db/_codemap'),
    //require('./gossip_server/_codemap'),
    require('./launcher/_codemap'),
    //require('./learner/_codemap'),
    require('./logger/_codemap'),
    require('./map/_codemap'),
    //require('./ticker_server/_codemap'),
    //require('./tweet_reporter/_codemap'),
    //require('./twitter_client/_codemap')
  ]
}