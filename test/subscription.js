'use strict';

const moment = require('moment');
const Subscription = require('../lib/models/subscription');

describe('Subscription', () => {
  let subscription, accounts, wondertel, amazecom, expectedResult;
  
  before(() => {
    accounts = require('../data/accounts.json');
    wondertel = require('../data/wondertel.json');
    amazecom = require('../data/amazecom.json');
    expectedResult = require('./fixture/expected_output.json');

    subscription = new Subscription(accounts.users, [
      {
        name: 'Wondertel',
        data: wondertel,
      },
      {
        name: 'Amazecom',
        data: amazecom,
      }
    ]);
  });

  describe('#constructor', () => {
    it('should have 2 partners after initialization', () => {
      expect(subscription.partners.length).to.equal(2);
      expect(subscription.partners[0].name).to.equal('Wondertel');      
      expect(subscription.partners[1].name).to.equal('Amazecom');      
    });
  });

  describe('#getSubscriptions', () => {
    it('should return result matching with the fixture', () => {
      const result = subscription.getSubscriptions();
      expect(result).to.deep.equal(expectedResult.subscriptions);
    });
  });
});