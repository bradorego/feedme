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
      ///obj.user, obj.items, obj.restaurant
      EatStreet.submitOrder = function (obj) {
        var d = $q.defer(),
          formattedItems = obj.items.map(function (item) { return {"apiKey": item.apiKey};});
        var tempOrder = {
          "apiKey": "7422332c294e951182e0cae4654d77350320b34b47176fee",
          "items": [
            {
              "apiKey": "35191",
              "comments": "Pile it high!",
              "name": "8. Angel Chicken Wing (4)",
              "basePrice": 6.95,
              "totalPrice": 6.95,
              "customizationChoices": []
            }
          ],
          "method": "pickup",
          "payment": "cash",
          "tip": 0,
          "restaurantApiKey": "90fd4587554469b1f15b4f2e73e761809f4b4bcca52eedca",
          "comments": null,
          "recipientApiKey": "485ca34bedf9153e7ecdb0c1c698d2cee41ee9406039e889",
          "card": null,
          "address": null,
          "datePlaced": 1467322105
        };
        User.update({ /// hope this succeeds
          currentOrder: tempOrder
        });
        d.resolve(tempOrder);
        return d.promise;

        // ESApi.submitOrder({
        //   'restaurantApiKey': obj.restaurant.apiKey,
        //   'items': formattedItems,
        //   'method': 'delivery',
        //   'payment': 'card',
        //   'card': obj.user.card,
        //   'address': obj.user.address,
        //   'recipient': obj.user.apiKey
        // }, function (order) {
        //   if (order.error) {
        //     return d.reject(order);
        //   }
        //   User.update({ /// hope this succeeds
        //     currentOrder: order
        //   }, function () {

        //   }, function (err) {
        //     User.update({ /// retry it with just a flag?
        //       currentOrder: true
        //     });
        //   });
        //   return d.resolve(order);
        // });
        // return d.promise;
      };

      /// obj.amount
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
                    var items = [],
                      normalizedName = '',
                      runningCost = 0, /// how much we've spent so far
                      itemIndex = 0, /// holding onto randomly selected menu item
                      actualPrice = 0, /// price after tax
                      toOrder = [];
                    menu.forEach(function (obj) {
                      normalizedName = obj.name.toLowerCase();
                      if ((normalizedName.indexOf('dessert') === -1) &&
                          (normalizedName.indexOf('beverage') === -1) &&
                          (normalizedName.indexOf('shake') === -1) &&
                          (normalizedName.indexOf('drink') === -1) &&
                          (normalizedName.indexOf('kid') === -1) &&
                          (normalizedName.indexOf('sweet') === -1) &&
                          (normalizedName.indexOf('side') === -1) &&
                          (normalizedName.indexOf('extra') === -1) &&
                          (normalizedName.indexOf('build') === -1)) { /// I hope this is enough
                        items = items.concat(obj.items); // flatten all menu items to one list
                      }
                    });
                    ///TODO: fix this (modularize, recall function, etc)
                    if (!items.length) { // start over?
                      return d.reject({message: "No valid items for this restaurant"});
                    }
                    for (runningCost = luckyRestaurant.deliveryPrice; runningCost < obj.amount;) {
                      itemIndex = Math.floor(Math.random() * items.length);
                      actualPrice = (items[itemIndex].basePrice * (1 + luckyRestaurant.taxRate));
                      if ((runningCost + actualPrice) >= obj.amount) {
                        if (toOrder.length === 0) {
                          console.log("sadtrombone.com");
                          continue; /// let's make sure there's at least one item....
                        } else {
                          break;
                        }
                      } else {  /// we can add it!
                        toOrder.push(items[itemIndex]);
                        items.splice(itemIndex, 1); /// no duplicates
                        runningCost += actualPrice;
                      }
                    }
                    console.log(runningCost, toOrder);
                    EatStreet.submitOrder({
                      user: profile,
                      items: toOrder,
                      restaurant: luckyRestaurant
                    }).then(function (order) {
                      /*
                      {
                        "apiKey": "7422332c294e951182e0cae4654d77350320b34b47176fee",
                        "items": [
                          {
                            "apiKey": "35191",
                            "comments": "Pile it high!",
                            "name": "8. Angel Chicken Wing (4)",
                            "basePrice": 6.95,
                            "totalPrice": 6.95,
                            "customizationChoices": []
                          }
                        ],
                        "method": "pickup",
                        "payment": "cash",
                        "tip": 0,
                        "restaurantApiKey": "90fd4587554469b1f15b4f2e73e761809f4b4bcca52eedca",
                        "comments": null,
                        "recipientApiKey": "485ca34bedf9153e7ecdb0c1c698d2cee41ee9406039e889",
                        "card": null,
                        "address": null,
                        "datePlaced": 1467322105
                      }
                      */
                      d.resolve(order);
                    }, handleErr);
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
