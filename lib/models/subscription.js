'use strict';

const Joi = require('joi');
const _ = require('lodash');
const Partner = require('./partner');
const logger = require('../utils/logger');

class Subscription {
  constructor (_accounts, _partners) {
    const schema = Joi.object().keys({
      accounts: Joi.array().items(Joi.object().keys({
          number: Joi.string().trim(),
          name: Joi.string().trim(),
        }).requiredKeys('number', 'name')),
      partners: Joi.array().items(Joi.object().keys({
          name: Joi.string().trim(),
          data: Joi.object().keys({
              revocations: Joi.array(),
              grants: Joi.array(),
            }),
        }).requiredKeys('name', 'data')),
    }).requiredKeys('accounts', 'partners');

    const { accounts, partners } = Joi.attempt({
      accounts: _accounts,
      partners: _partners,
    }, schema);

    this.accounts = accounts;
    this.partners = [];

    this._loadPartners(partners);
  }

  _loadPartners (partners) {
    _.each(partners, (partner) => {
      const newPartner = new Partner(partner.name, this.accounts);
      this.partners.push(newPartner);

      newPartner.load(partner.data);
    });
  }

  getSubscriptions () {
    const users = this._getUniqueUsersFromAllPartners();
    const subscriptions = _.reduce(users, (subscriptions, user) => {
      const offers = this._getAllOffersFromAllPartners(user.id);
      const userOffers = this._getAllValidOffersForUser(user, offers);

      subscriptions[user.name] = userOffers;
      return subscriptions;
    }, {});

    return subscriptions;
  }

  _getAllValidOffersForUser (user, offers) {
    const userOffer = {};
    userOffer[user.name] = {};

    this._validUserOffers(user, offers);

    const partnersOffer = _.reduce(this.partners, (partnerOffer, partner) => {
      const selectedUser = partner.users[user.id];
      if (!selectedUser) return partnerOffer;

      const freeDays = _.reduce(selectedUser.offers, (days, offer) => {
        if (offer.valid) {
          days += offer.days;
        }

        return days;
      }, 0);

      if (freeDays > 0) partnerOffer[partner.name] = freeDays;
      return partnerOffer;
    }, {});

    return _.extend(userOffer[user.name], partnersOffer);
  }

  _validUserOffers (user, offers) {
    if (!offers.length) return;

    const sortedOffers = _.sortBy(offers, ['startDate']);    
    
    let previousOffer = sortedOffers[0];
    let currentOffer;
    for (let i = 1; i < sortedOffers.length; i++) {
      currentOffer = sortedOffers[i];

      if (previousOffer.isBetween(currentOffer.startDate)) {
        currentOffer.valid = false;
        logger.warn(`Partner (${currentOffer.givenBy}):: ${user.name}'s offer [date: ${currentOffer.startDate}, period: ${currentOffer.period}] is ignore due to the offer from ${previousOffer.givenBy}`);
      } else if ((previousOffer.givenBy !== currentOffer.givenBy) && (previousOffer.isRevoked === false)) {
        currentOffer.valid = false;
        logger.warn(`Partner (${currentOffer.givenBy}):: ${user.name}'s offer [date: ${currentOffer.startDate}, period: ${currentOffer.period}] is ignore due to the offer from ${previousOffer.givenBy}`);
      } else {
        previousOffer = currentOffer;
      }
    }
  }

  _getAllOffersFromAllPartners (userId) {
    let offers = [];
    _.each(this.partners, (partner) => {
      const user = partner.users[userId];
      if (user) {
        const userOffers = _.map(user.offers, (offer) => {
          offer.givenBy = partner.name;
          return offer;        
        });

        offers = offers.concat(userOffers);
      }
    });

    return offers;
  }

  _getUniqueUsersFromAllPartners () {
    const users = {};
    _.each(this.partners, (partner) => {
      _.each(partner.users, (user) => {
        if (!users[user.id]) {
          users[user.id] = { id: user.id, name: user.name };
        }
      });
    });

    return users;
  }
}

module.exports = Subscription;