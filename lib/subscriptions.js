'use strict';

const accounts = require('../data/accounts.json');
const wondertel = require('../data/wondertel.json');
const amazecom = require('../data/amazecom.json');
const Subscription = require('./models/subscription');
const logger = require('./utils/logger');
const program = require('commander');
const fs = require('fs');

program
  .version('1.0.0')
  .option('-v, --verbose <level>', 'set error level', /^(debug|info|warn|error)$/i, 'info')
  .parse(process.argv);

logger.transports.console.level = program.verbose;

const subscription = new Subscription(accounts.users, [
  {
    name: 'Wondertel',
    data: wondertel,
  },
  {
    name: 'Amazecom',
    data: amazecom,
  }
]);

const result = subscription.getSubscriptions();
const data = { subscriptions: result };

fs.writeFile(__dirname + '/../output/result.json', JSON.stringify(data, null, 2), { encoding: 'utf8' }, (err) => {
  if (err) {
    return logger.error('Error writing result to file', err.messsage);
  }

  logger.info('DONE');
});


