'use strict';

const moment = require('moment');
const User = require('../lib/models/user');
const Offer = require('../lib/models/offer');

describe('User', () => {
  let user;
  const offer1 = '2015-02-21T15:10:01+00:00';
  const offer2 = '2015-03-21T15:10:01+00:00';
  const offer3 = '2015-12-21T15:10:01+00:00';
  
  describe('#grantOffer', () => {
    before(() => {
      user = new User(1, 'user 1');    
    });

    it('should have 1 offer as same as the adding one', () => {
      user.grantOffer(offer1, 2);

      expect(user.offers.length).to.be.equal(1);
      expect(user.offers[0].startDate).to.deep.equal(moment(offer1).toDate());
      expect(user.offers[0].endDate).to.deep.equal(moment('2015-04-21T15:10:01+00:00').toDate());
    });

    it('should have 1 offer if new offer is overlaped', () => {
      user.grantOffer(offer2, 3);

      expect(user.offers.length).to.be.equal(1);
      expect(user.offers[0].startDate).to.deep.equal(moment(offer1).toDate());
      expect(user.offers[0].endDate).to.deep.equal(moment('2015-07-21T15:10:01+00:00').toDate());
    });    

    it('should have 2 offers if new offer is not overlaped', () => {
      user.grantOffer(offer3, 1);

      expect(user.offers.length).to.be.equal(2);
      expect(user.offers[1].startDate).to.deep.equal(moment(offer3).toDate());
      expect(user.offers[1].endDate).to.deep.equal(moment('2016-01-21T15:10:01+00:00').toDate());
    });        
  });

  describe('#revokeOffer', () => {
    beforeEach(() => {
      user = new User(1, 'user 1');
      user.grantOffer(offer1, 2);
    });

    it('should make revoked offer having end date as revoking date', () => {
      const revokeDate = '2015-03-21T15:10:01+00:00';
      user.revokeOffer(revokeDate);

      expect(user.offers.length).to.be.equal(1);
      expect(user.offers[0].startDate).to.deep.equal(moment(offer1).toDate());
      expect(user.offers[0].endDate).to.deep.equal(moment(revokeDate).toDate());
      expect(user.offers[0].days).to.equal(28);
      expect(user.offers[0].isRevoked).to.equal(true);   
    });

    it('should create new offer with start and end date are the same if revoking date is earlier than offer start date', () => {
      const revokeDate = '2015-01-21T15:10:01+00:00';
      user.revokeOffer(revokeDate);

      expect(user.offers.length).to.be.equal(2);
      expect(user.offers[0].startDate).to.deep.equal(moment(offer1).toDate());
      expect(user.offers[0].endDate).to.deep.equal(moment('2015-04-21T15:10:01+00:00').toDate());
      expect(user.offers[0].isRevoked).to.equal(false);   

      expect(user.offers[1].startDate).to.deep.equal(moment(revokeDate).toDate());
      expect(user.offers[1].endDate).to.deep.equal(moment(revokeDate).toDate());
      expect(user.offers[1].isRevoked).to.equal(true);   
    });

    it('should create new offer with start and end date are the same if revoking date is later than offer end date', () => {
      const revokeDate = '2015-04-22T15:10:01+00:00';
      user.revokeOffer(revokeDate);

      expect(user.offers.length).to.be.equal(2);
      expect(user.offers[0].startDate).to.deep.equal(moment(offer1).toDate());
      expect(user.offers[0].endDate).to.deep.equal(moment('2015-04-21T15:10:01+00:00').toDate());
      expect(user.offers[0].isRevoked).to.equal(false);   

      expect(user.offers[1].startDate).to.deep.equal(moment(revokeDate).toDate());
      expect(user.offers[1].endDate).to.deep.equal(moment(revokeDate).toDate());
      expect(user.offers[1].isRevoked).to.equal(true);         
    });
  });  
});