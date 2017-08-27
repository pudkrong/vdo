'use strict';

const moment = require('moment');
const _ = require('lodash');
const Partner = require('../lib/models/partner');

describe('Partner', () => {
  let partner;
  const accounts = [
    {
      number: '1',
      name: 'one'
    },
    {
      number: '2',
      name: 'two'
    }
  ];
  
  describe('#grant', () => {
    before(() => {
      partner = new Partner('Partner 1', accounts);
    });

    it('should throw error if user does not exist', () => {
      expect(() => {
        partner.grant('3', '2015-02-21T15:10:01+00:00', 1);  
      }).throw('Account (3) does not exist');
    });

    it('should have 1 user with offer', () => {
      const grantDate = '2015-02-21T15:10:01+00:00';
      partner.grant('1', grantDate, 3);

      expect(_.keys(partner.users).length).to.equal(1);
      expect(partner.users['1'].name).to.equal('one');
      expect(partner.users['1'].offers.length).to.equal(1);
      expect(partner.users['1'].offers[0].startDate).to.deep.equal(moment(grantDate).toDate());
    });
  }); 

  describe('#revoke', () => {
    let grantDate;
    before(() => {
      grantDate = '2015-02-21T15:10:01+00:00';
      partner = new Partner('Partner 1', accounts);
      partner.grant('1', grantDate, 3);
    });

    it('should throw error if user does not exist', () => {
      expect(() => {
        partner.revoke('3', grantDate);  
      }).throw('User (3) is not found');
    });

    it('should create new offer with start and end dates are the same if revokind date is earlier than offer', () => {
      const revokeDate = '2015-02-20T15:10:01+00:00';
      partner.revoke('1', revokeDate);

      expect(_.keys(partner.users).length).to.equal(1);
      expect(partner.users['1'].name).to.equal('one');
      expect(partner.users['1'].offers.length).to.equal(2);
      expect(partner.users['1'].offers[0].startDate).to.deep.equal(moment(grantDate).toDate());
      expect(partner.users['1'].offers[0].endDate).to.deep.equal(moment('2015-05-21T15:10:01+00:00').toDate());      
      expect(partner.users['1'].offers[0].isRevoked).to.equal(false);      
      expect(partner.users['1'].offers[1].startDate).to.deep.equal(moment(revokeDate).toDate());
      expect(partner.users['1'].offers[1].endDate).to.deep.equal(moment(revokeDate).toDate());      
      expect(partner.users['1'].offers[1].isRevoked).to.equal(true);      
    });

    it('should reduce offer', () => {
      const revokeDate = '2015-02-25T15:10:01+00:00'; 
      partner.revoke('1', revokeDate);

      expect(_.keys(partner.users).length).to.equal(1);
      expect(partner.users['1'].name).to.equal('one');
      expect(partner.users['1'].offers.length).to.equal(2);
      expect(partner.users['1'].offers[0].startDate).to.deep.equal(moment(grantDate).toDate());
      expect(partner.users['1'].offers[0].endDate).to.deep.equal(moment(revokeDate).toDate());      
    });
  });   
});