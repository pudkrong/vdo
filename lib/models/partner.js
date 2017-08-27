'use strict';

const Joi = require('joi');
const _ = require('lodash');
const logger = require('../utils/logger');
const User = require('./user');

class Partner {
  constructor (name, accounts) {
    this.name = name;
    this.accounts = accounts;
    this.users = {};
  }

  load (data) {
    _.each(data.grants, (grant) => {
      if (grant.period) {
        try {
          this.grant(grant.number, grant.date, grant.period);
        } catch (ex) {
          logger.error(`Partner (${this.name})::Grant => ${ex.message}`);
        }
      } else {
        logger.warn(`Partner (${this.name}) grants user (${grant.number}) without any period`);
      }
    });

    _.each(data.revocations, (revocation) => {
      try {
        this.revoke(revocation.number, revocation.date);
      } catch (ex) {
        logger.error(`Partner (${this.name})::Revoke => ${ex.message}`);
      }
    });    
  }

  grant (_id, _date, _period) {
    const schema = Joi.object().keys({
      id: Joi.string().trim(),
      date: Joi.alternatives().try(Joi.date(), Joi.date().iso()),
      period: Joi.number().integer().min(0),
    }).requiredKeys('id', 'date', 'period');

    const { id, date, period } = Joi.attempt({
      id: _id,
      date: _date,
      period: _period,
    }, schema);

    let user = this.users[id];
    if (!user) {
      user = this._addUser(id);
    }

    user.grantOffer(date, period);    
  }

  _addUser (id) {
    const account = this._getAccount(id);
    if (!account) throw new Error(`Account (${id}) does not exist`);

    const user = new User(id, account.name);
    this.users[id] = user;

    return user;
  }

  _getAccount (id) {
    const account = _.find(this.accounts, (account) => {
      return account.number == id;
    });

    return account;
  }

  revoke (_id, _date) {
    const schema = Joi.object().keys({
      id: Joi.string().trim(),
      date: Joi.alternatives().try(Joi.date(), Joi.date().iso()),
    }).requiredKeys('id', 'date');

    const { id, date } = Joi.attempt({
      id: _id,
      date: _date,
    }, schema);

    let user = this.users[id];
    if (!user) throw new Error(`User (${id}) is not found`);

    user.revokeOffer(date);
  }

  // getActiveUsers () {
  //   const activeUsers = _.filter(this.users, (user) => {
  //     return !user.isReleased;
  //   });

  //   return _.keyBy(activeUsers, 'id');
  // }

  // getReleasedUsers () {
  //   const releasedUsers = _.filter(this.users, (user) => {
  //     return user.isReleased;
  //   });

  //   return _.keyBy(releasedUsers, 'id');    
  // }
}

module.exports = Partner;