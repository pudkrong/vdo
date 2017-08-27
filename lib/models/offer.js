'use strict';

const moment = require('moment');
const Joi = require('joi');

class Offer {
  constructor (_startDate, _period) {
    const schema = Joi.object().keys({
      startDate: Joi.date().iso(),
      period: Joi.number().integer().min(0),      
    }).requiredKeys('startDate', 'period');

    const { startDate, period } = Joi.attempt({
      startDate: _startDate,
      period: _period,
    }, schema);

    this.startDate = startDate;
    this.period = period;
    this.endDate = this._calculateEndDate();    
    this.days = null;
    this.isRevoked = false;
    this.valid = true;

    this._postUpdate();
  }

  isOverlapped (_anotherOffer) {
    const schema = Joi.object().keys({
      anotherOffer: Joi.object().type(Offer),
    }).requiredKeys('anotherOffer');

    const { anotherOffer } = Joi.attempt({
      anotherOffer: _anotherOffer,
    }, schema);

    return !(
      moment(anotherOffer.endDate).isBefore(this.startDate) || 
      moment(this.endDate).isBefore(anotherOffer.startDate)
    );    
  }

  merge (_anotherOffer) {
    const schema = Joi.object().keys({
      anotherOffer: Joi.object().type(Offer),
    }).requiredKeys('anotherOffer');

    const { anotherOffer } = Joi.attempt({
      anotherOffer: _anotherOffer,
    }, schema);

    if (!this.isOverlapped(anotherOffer)) throw new Error('The given merging offer must overlap with the one to be merged');

    this.startDate = (this.startDate < anotherOffer.startDate) ? this.startDate : anotherOffer.startDate;
    this.period += anotherOffer.period;
    this.endDate = this._calculateEndDate();

    this._postUpdate();
  }

  revoke (_date) {
    const schema = Joi.object().keys({
      date: Joi.alternatives().try(Joi.date(), Joi.date().iso()),
    }).requiredKeys('date');

    const { date } = Joi.attempt({
      date: _date,
    }, schema);

    this.endDate = date;
    this.isRevoked = true;

    this._postUpdate();
  }

  isBetween (_date) {
    const schema = Joi.object().keys({
      date: Joi.alternatives().try(Joi.date(), Joi.date().iso()),
    }).requiredKeys('date');

    const { date } = Joi.attempt({
      date: _date,
    }, schema);

    return moment(date).isBetween(this.startDate, this.endDate, null, '()');
  }

  isAfterExpiry (_date) {
    const schema = Joi.object().keys({
      date: Joi.alternatives().try(Joi.date(), Joi.date().iso()),
    }).requiredKeys('date');

    const { date } = Joi.attempt({
      date: _date,
    }, schema);

    return moment(date).isSameOrAfter(this.endDate);    
  }

  _postUpdate () {
    this.days = this._calculateDays();
  }

  _calculateEndDate () {
    const endDate = moment(this.startDate).utc().add(this.period, 'month').toDate();

    return endDate;
  }

  _calculateDays () {
    const days = moment(this.endDate).diff(this.startDate, 'days');

    return days;
  }
}

module.exports = Offer;