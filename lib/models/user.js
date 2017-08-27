'use strict';

const moment = require('moment');
const Joi = require('joi');
const _ = require('lodash');
const Offer = require('./offer');

class User {
  constructor (id, name = '') {
    this.id = id;
    this.name = name;
    this.offers = [];
  } 

  revokeOffer (_date) {
    const schema = Joi.object().keys({
      date: Joi.alternatives().try(Joi.date(), Joi.date().iso()),
    }).requiredKeys('date');

    const { date } = Joi.attempt({
      date: _date,
    }, schema);

    const offer = this._findInBetweenOffer(date);
    if (offer) {
      offer.revoke(date);
    } else {
      const revokedOffer = new Offer(date, 0);
      this.offers.push(revokedOffer);

      revokedOffer.revoke(date);
    }
  }

  _findInBetweenOffer (date) {
    const offer = _.find(this.offers, (offer) => {
      return offer.isBetween(date);
    });

    return offer;
  }

  grantOffer (_date, _period) {
    const schema = Joi.object().keys({
      date: Joi.alternatives().try(Joi.date(), Joi.date().iso()),
      period: Joi.number().integer().min(0),
    }).requiredKeys('date', 'period');

    const { date, period } = Joi.attempt({
      date: _date,
      period: _period,
    }, schema);

    const newOffer = new Offer(date, period);
    const overlappedOffer = this._findOverlappedOffer(newOffer);
    if (overlappedOffer) {
      overlappedOffer.merge(newOffer);
    } else {
      this.offers.push(newOffer);
    }
  }

  _findOverlappedOffer (newOffer) {
    const offer = _.find(this.offers, (offer) => {
      return offer.isOverlapped(newOffer);
    });

    return offer;
  }
}

module.exports = User;