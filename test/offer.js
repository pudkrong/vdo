'use strict';

const moment = require('moment');
const Offer = require('../lib/models/offer');

describe('Offer', () => {
  let offer;
  const offer1 = '2015-02-21T15:10:01+00:00';
  
  beforeEach(() => {
    offer = new Offer(offer1, 2);
  });

  it('should have start date, end date, and days after initialized', () => {
    expect(offer.startDate).to.deep.equal(moment(offer1).toDate());
    expect(offer.endDate).to.deep.equal(moment('2015-04-21T15:10:01+00:00').toDate());
    expect(offer.days).to.equal(59);
  });

  describe('#isOverlapped', () => {
    // x-----x
    //         y-----y
    it('should return false if the given offer is before', () => {
      const anotherOffer = new Offer('2014-07-21T15:10:01+00:00', 2);
      const isOverlapped = offer.isOverlapped(anotherOffer);

      expect(isOverlapped).to.equal(false);
    });

    //          x-----x   
    // y-----y
    it('should return false if the given offer is after', () => {
      const anotherOffer = new Offer('2015-05-25T15:10:01+00:00', 1);
      const isOverlapped = offer.isOverlapped(anotherOffer);

      expect(isOverlapped).to.equal(false);
    });    

    // x-----x
    //     y-----y
    it('should return true if the given offer is overlapped', () => {
      const anotherOffer = new Offer('2015-01-21T15:10:01+00:00', 2);
      const isOverlapped = offer.isOverlapped(anotherOffer);

      expect(isOverlapped).to.equal(true);
    });

    //     x-----x   
    // y-----y
    it('should return true if the given offer is overlapped', () => {
      const anotherOffer = new Offer('2015-02-25T15:10:01+00:00', 5);
      const isOverlapped = offer.isOverlapped(anotherOffer);

      expect(isOverlapped).to.equal(true);
    });

    //   x-x   
    // y-----y
    it('should return true if the given offer is overlapped', () => {
      const anotherOffer = new Offer('2015-02-25T15:10:01+00:00', 1);
      const isOverlapped = offer.isOverlapped(anotherOffer);

      expect(isOverlapped).to.equal(true);
    });

    // x--------x   
    //   y-----y
    it('should return true if the given offer is overlapped', () => {
      const anotherOffer = new Offer('2015-01-25T15:10:01+00:00', 7);
      const isOverlapped = offer.isOverlapped(anotherOffer);

      expect(isOverlapped).to.equal(true);
    });
  });

  describe('#isBetween', () => {
    it('should return false if the given date is not in the offer', () => {
      const isBetween = offer.isBetween('2015-02-21T15:10:01+00:00');

      expect(isBetween).to.equal(false);
    });

    it('should return false if the given date is the same date of offer.startDate', () => {
      const isBetween = offer.isBetween(offer.startDate);

      expect(isBetween).to.equal(false);
    });

    it('should return false if the given date is the same date of offer.endDate', () => {
      const isBetween = offer.isBetween(offer.endDate);

      expect(isBetween).to.equal(false);
    });    

    it('should return true if the given date is between the offer', () => {
      const isBetween = offer.isBetween('2015-02-22T15:10:01+00:00');

      expect(isBetween).to.equal(true);
    });    
  });  

  describe('#isAfterExpiry', () => {
    it('should return true if the given date is after offer.endDate', () => {
      const isAfterExpiry = offer.isAfterExpiry('2015-04-22T15:10:01+00:00');

      expect(isAfterExpiry).to.equal(true);
    });

    it('should return true if the given date is exactly same as offer.endDate', () => {
      const isAfterExpiry = offer.isAfterExpiry(offer.endDate);

      expect(isAfterExpiry).to.equal(true);
    });

    it('should return false if the given date is between the offer', () => {
      const isAfterExpiry = offer.isAfterExpiry('2015-03-22T15:10:01+00:00');

      expect(isAfterExpiry).to.equal(false);
    });

    it('should return false if the given date is before the offer.startDate', () => {
      const isAfterExpiry = offer.isAfterExpiry('2015-02-20T15:10:01+00:00');

      expect(isAfterExpiry).to.equal(false);
    });
  });  

  describe('#merge', () => {    
    it('should merge offer with having start date later', () => {
      const anotherOffer = new Offer('2015-03-25T15:10:01+00:00', 3);
      offer.merge(anotherOffer);

      expect(offer.startDate).to.deep.equal(moment(offer1).toDate());
      expect(offer.period).to.equal(5);
      expect(offer.endDate).to.deep.equal(moment('2015-07-21T15:10:01+00:00').toDate());
    });

    it('should merge offer with having start date earlier', () => {
      const anotherOffer = new Offer('2015-01-25T15:10:01+00:00', 3);
      offer.merge(anotherOffer);

      expect(offer.startDate).to.deep.equal(moment('2015-01-25T15:10:01+00:00').toDate());
      expect(offer.period).to.equal(5);
      expect(offer.endDate).to.deep.equal(moment('2015-06-25T15:10:01+00:00').toDate());
    });    
  });    

  describe('#revoke', () => {    
    it('should change end date to revoking date', () => {
      offer.revoke('2015-02-23T15:10:01+00:00');

      expect(offer.startDate).to.deep.equal(moment(offer1).toDate());
      expect(offer.period).to.equal(2);
      expect(offer.endDate).to.deep.equal(moment('2015-02-23T15:10:01+00:00').toDate());
      expect(offer.isRevoked).to.equal(true);
    });
  });      
});