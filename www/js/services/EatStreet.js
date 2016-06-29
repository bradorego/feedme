// EatStreet.js
/*global  ESApi */
(function () {
  'use strict';
  var ESFact = [
    'ES_API_KEY',
    '$q',
    'User',
    function (ES_API_KEY, $q, User) {
      var EatStreet = {},
        initialized = false;

      EatStreet.init = function () {
        ESApi.init(ES_API_KEY);
        initialized = true;
      };
      EatStreet.createUser = function (profile, phoneNumber) {
        var nameChunks = profile.name.split(" "),
          user = {
            'email': profile.email,
            'password': Math.random().toString(36).substr(-12),
            'firstName': nameChunks.shift(),
            'lastName': nameChunks.pop(),
            'phone': phoneNumber
          },
          d = $q.defer();
        if (!initialized) {
          EatStreet.init();
        }
        ESApi.registerUser(user, function (newUser) {
          if (newUser.error) {
            return d.reject(newUser);
          }
          User.update({
            phone: user.phone,
            es_password: user.password,
            apiKey: newUser.apiKey
          })
            .then(function () { ///resp) {
              return d.resolve(user);
            }, function (err) {
              /// ruh roh
              return d.reject(err);
            });
          console.log(newUser);
        });
        return d.promise;
      };

      /// obj.user, obj.address, obj.city, obj.state, obj.zip
      EatStreet.addAddress = function (obj) {
        var d = $q.defer();
        if (!initialized) {
          EatStreet.init();
        }
        ESApi.addAddress({
          'apiKey': obj.user.apiKey,
          'streetAddress': obj.address,
          'city': obj.city,
          'state': obj.state,
          'zip': obj.zip
        }, function (address) {
          if (address.error) {
            return d.reject(address);
          }
          User.update({
            address: address
          })
            .then(function (user) {
              return d.resolve(user);
            }, function (err) {
              return d.reject(err);
            });
        });
        return d.promise;
      };

      /// obj.people, obj.amount
      EatStreet.placeOrder = function (obj) {
        var d = $q.defer(),
          missing = {
            address: false,
            phone: false,
            card: false
          },
          goodToGo = true;
        User.getProfile()
          .then(function (profile) {
            if (!profile.address) {
              missing.address = true;
              goodToGo = false;
            }
            if (!profile.phone) {
              missing.phone = true;
              goodToGo = false;
            }
            if (!profile.card) {
              missing.card = true;
              goodToGo = false;
            }
            if (goodToGo) { /// have all the info we need - onward!
              /// do algorithm stuff here
              if (!initialized) {
                EatStreet.init();
              }
              angular.noop(obj);
            } else {
              missing.status = 1001;
              return d.reject(missing);
            }
          }, function (err) {
            return d.reject(err);
          });

        return d.promise;
      };

      /// obj.user, obj.name, obj.address, obj.zip, obj.cardNumber, obj.cvv, obj.expMonth, obj.expYear
      EatStreet.addCard = function (obj) {
        var d = $q.defer();
        if (!initialized) {
          EatStreet.init();
        }
        ESApi.addCard({
          'apiKey': obj.user.apiKey,
          'cardholderName': obj.name,
          'cardholderStreetAddress': obj.address,
          'cardholderZip': obj.zip,
          'cardNumber': obj.cardNumber,
          'cvv': obj.cvv,
          'expirationMonth': obj.expMonth,
          'expirationYear': obj.expYear
        }, function (card) {
          if (card.error) {
            return d.reject(card);
          }
          User.update({
            card: card
          }).then(function (user) {
            return d.resolve(user);
          }, function (err) {
            return d.reject(err);
          });
        });
        return d.promise;
      };

      return EatStreet;
    }
  ];

  angular.module('feed-me')
    .service('EatStreet', ESFact);
}());
