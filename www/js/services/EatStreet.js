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

      /// obj.streetAddress, obj.method
      EatStreet.searchRestaurants = function (obj) {
        var d = $q.defer();
        ESApi.searchRestaurants({
          'street-address': obj.streetAddress,
          'method': obj.method
        }, function (rest) {
          if (rest.error) {
            return d.reject(rest);
          }
          return d.resolve(rest);
        });
        return d.promise;
      };
      EatStreet.getMenu = function (restaurant) {
        var d = $q.defer();
        ESApi.getRestaurantMenu({
          apiKey: restaurant.apiKey
        }, function(menuCategories) {
          if (menuCategories.error) {
            return d.reject(menuCategories);
          }
          console.log(menuCategories);
          return d.resolve(menuCategories);
        });
        return d.promise;
      };

      /// obj.people, obj.amount
      EatStreet.feedMe = function (obj) {
        var d = $q.defer(),
          missing = {},
          handleErr = function (err) {
            console.warn(err);
            return d.reject(err);
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
              ////TODO: use search parameter in conjunction with user preferences/toggles
              EatStreet.searchRestaurants({
                'streetAddress': profile.address.streetAddress + " " + profile.address.city + ", " + profile.address.state,
                'method': 'delivery'
              }).then(function (restaurants) {
                var result = restaurants.restaurants.filter(function (item) {
                    return (item.minWaitTime <= 45) && (item.deliveryPrice <= 3) && (item.deliveryMin <= 10); /// fuck that noise
                  }),
                  luckyRestaurant = {};
                luckyRestaurant = result[Math.floor(Math.random() * result.length)];
                console.log(luckyRestaurant);
                EatStreet.getMenu(luckyRestaurant)
                  .then(function (menu) {

                    d.resolve(menu);
                  }, handleErr);
              }, handleErr);
            } else {
              missing.status = 1001;
              return d.reject(missing);
            }
          }, handleErr);

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
