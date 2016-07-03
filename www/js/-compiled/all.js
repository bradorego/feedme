// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
(function () {
  'use strict';
  var appResolve = {
    'isLoggedIn': [
      'User',
      '$state',
      '$rootScope',
      function (User, $state, $rootScope) {
        User.getProfile()
          .then(function (data) {
            if (!data.$id) {
              return $state.go('login');
            }
            $rootScope.profile = data;
            return data;
          }, function (err) { ///err) {
            console.warn(err);
            $state.go('login');
          });
      }]
  },
    appRun = [
      '$ionicPlatform',
      '$rootScope',
      '$state',
      'User',
      '$ionicLoading',
      '$http',
      '$timeout',
      function ($ionicPlatform, $rootScope, $state, User, $ionicLoading, $http, $timeout) {
        var stateTimeout = {};
        $ionicPlatform.ready(function () {
          // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
          // for form inputs)
          if (window.cordova && window.cordova.plugins.Keyboard) {
            window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            window.cordova.plugins.Keyboard.disableScroll(true);
          }
          if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            window.StatusBar.styleDefault();
          }
        });
        //// FROM CLASSIC II
        /*jslint unparam: true*/
        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
          console.error("stateChangeError", error);
          $ionicLoading.hide();
          $rootScope.cancelTimeout();
        });
        /*jslint unparam:false */
        $rootScope.$on('$stateChangeStart', function () {
          stateTimeout = $timeout(function () { //If transition takes longer than 30 seconds, timeout.
            $ionicLoading.hide();
            // $ionicPopup.alert({'title': 'Timed Out', 'template': 'Communication with the server timed out. Please check your connection and try again.'});
            angular.forEach($http.pendingRequests, function (req) {
              if (req.abort) {
                req.abort.resolve();
              }
            });
          }, 30000);
        });
        $rootScope.$on('$stateChangeSuccess', function () {
          $rootScope.cancelTimeout();
        });
        $rootScope.cancelTimeout = function () {
          $timeout.cancel(stateTimeout);
        };
        $rootScope.closeLoading = function () {
          $ionicLoading.hide();
          angular.forEach($http.pendingRequests, function (req) {
            if (req.abort) {
              req.abort.resolve();
            }
          });
        };
        $rootScope.signOut = function () {
          User.logOut();
          $state.go('login');
        };
        //// END FROM
        User.getProfile()
          .then(function (profile) {
            var now = +new Date();
            if (profile.currentOrder) {
              if ((now - profile.currentOrder.estimatedDelivery) >= 7200000) { /// if your order is more than 2 hours old...
                User.update({
                  currentOrder: false
                });
              }
            }
          });
      }],
    appConfig = [
      '$stateProvider',
      '$urlRouterProvider',
      '$ionicLoadingConfig',
      function ($stateProvider, $urlRouterProvider, $ionicLoadingConfig) {
        $stateProvider
          .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'views/menu.html',
            controller: 'AppCtrl as appVM',
            resolve: appResolve
          });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
        $ionicLoadingConfig.template = "<img src='/img/loading.gif'>";
      }],
    appCtrl = [
      function () {
        angular.noop();
        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //$scope.$on('$ionicView.enter', function(e) {
        //});
      }];
  angular.module('User', []);
  angular.module('feed-me', ['ionic', 'ngAutocomplete', 'User', 'ngStorage', 'firebase'])
    .run(appRun)
    .config(appConfig)
    .controller('AppCtrl', appCtrl)
    .value('FB_ROOT', 'https://feed-me-madison.firebaseio.com')
    .value('ES_API_KEY', '8e525b5783313f3f');
}());

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
        try {
          ESApi.init(ES_API_KEY);
          initialized = true;
        } catch (err) {
          console.error(err);
        }
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
        try {
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
        } catch (err) {
          d.reject(err);
        }
        return d.promise;
      };

      /// obj.user, obj.address, obj.city, obj.state, obj.zip
      EatStreet.addAddress = function (obj) {
        var d = $q.defer();
        if (!initialized) {
          EatStreet.init();
        }
        try {
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
        } catch (err) {
          d.reject(err);
        }
        return d.promise;
      };

      EatStreet.getRestaurant = function (apiKey) {
        var d = $q.defer();
        if (!initialized) {
          EatStreet.init();
        }
        try {
          ESApi.getRestaurantDetails({
            'apiKey': apiKey
          }, function (restaurant) {
            if (restaurant.error) {
              return d.reject(restaurant);
            }
            return d.resolve(restaurant);
          });
        } catch (err) {
          d.reject(err);
        }
        return d.promise;
      };
      /// obj.streetAddress, obj.method
      EatStreet.searchRestaurants = function (obj) {
        var d = $q.defer();
        try {
          ESApi.searchRestaurants({
            'street-address': obj.streetAddress,
            'method': obj.method
          }, function (rest) {
            if (rest.error) {
              return d.reject(rest);
            }
            return d.resolve(rest);
          });
        } catch (err) {
          d.reject(err);
        }
        return d.promise;
      };
      EatStreet.getMenu = function (restaurant) {
        var d = $q.defer();
        try {
          ESApi.getRestaurantMenu({
            apiKey: restaurant.apiKey
          }, function (menuCategories) {
            if (menuCategories.error) {
              return d.reject(menuCategories);
            }
            console.log(menuCategories);
            return d.resolve(menuCategories);
          });
        } catch (err) {
          d.reject(err);
        }
        return d.promise;
      };
      ///obj.user, obj.items, obj.restaurant, obj.forRealsies
      EatStreet.submitOrder = function (obj) {
        var d = $q.defer(),
          formattedItems = obj.items.map(function (item) { return {"apiKey": item.apiKey}; }), //;
          tempOrder = {};
        if (obj.forRealsies) { /// should we actually submit the order?
          try {
            ESApi.submitOrder({
              'restaurantApiKey': obj.restaurant.apiKey,
              'items': formattedItems,
              'method': 'delivery',
              'payment': 'card',
              'card': obj.user.card,
              'address': obj.user.address,
              'recipient': obj.user.apiKey
            }, function (order) {
              if (order.error) {
                return d.reject(order);
              }
              order.datePlaced *= 1000;
              order.estimatedDelivery = order.datePlaced + 1800000; /// 30 minutes in ms
              User.update({ /// hope this succeeds
                currentOrder: order
              }, function () {

              }, function (err) {
                User.update({ /// retry it with just a flag?
                  currentOrder: true
                });
              });
              return d.resolve(order);
            });
          } catch (err) {
            d.reject(err);
          }
        } else {
          tempOrder = {
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
            "datePlaced": 1467322105000,
            "estimatedDelivery": 1467323905000
          };
          User.update({ /// hope this succeeds
            currentOrder: tempOrder
          });
          d.resolve(tempOrder);
        }
        return d.promise;
      };
      EatStreet.getOrderDetails = function (id) {
        var d = $q.defer();
        if (!initialized) {
          EatStreet.init();
        }
        try {
          ESApi.getOrder({
            'apiKey': id
          }, function (order) {
            if (order.error) {
              return d.reject(order);
            }
            order.datePlaced *= 1000;
            return d.resolve(order);
          });
        } catch (err) {
          d.reject(err);
        }
        return d.promise;
      };
      EatStreet.getOrderStatus = function (id) {
        var d = $q.defer();
        if (!initialized) {
          EatStreet.init();
        }
        try {
          ESApi.getOrderStatus({
            'apiKey': id
          }, function (status) {
            if (status.error) {
              return d.reject(status);
            }
            status.updated = new Date(status.updated);
            return d.resolve(status);
          });
        } catch (err) {
          d.reject(err);
        }
        return d.promise;
      };
      /// obj.amount, obj.forRealsies
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
                    for (runningCost = luckyRestaurant.deliveryPrice; runningCost < obj.amount; null) {
                      itemIndex = Math.floor(Math.random() * items.length);
                      actualPrice = (items[itemIndex].basePrice * (1 + luckyRestaurant.taxRate));
                      if ((runningCost + actualPrice) >= obj.amount) {
                        if (toOrder.length === 0) {
                          console.log("sadtrombone.com");
                          continue; /// let's make sure there's at least one item....
                        }
                        break;
                      }
                      toOrder.push(items[itemIndex]);
                      items.splice(itemIndex, 1); /// no duplicates
                      runningCost += actualPrice;
                    }
                    console.log(runningCost, toOrder);
                    EatStreet.submitOrder({
                      user: profile,
                      items: toOrder,
                      restaurant: luckyRestaurant,
                      forRealsies: obj.forRealsies
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
        try {
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
        } catch (err) {
          d.reject(err);
        }
        return d.promise;
      };

      return EatStreet;
    }
  ];

  angular.module('feed-me')
    .service('EatStreet', ESFact);
}());

// User.js
/*global firebase*/
(function () {
  'use strict';
  var UserFact = [
    '$firebaseObject',
    '$q',
    '$localStorage',
    function ($firebaseObject, $q, $localStorage) {
      var User = {},
        ref = firebase.database().ref(),
        profile = {},
        getProfileRef = function (id) {
          return $firebaseObject(ref.child('users').child(id));
        };
      function createUser(id, data) {
        var d = $q.defer(),
          profileRef = getProfileRef(id);

        profileRef.$id = data.uid;
        profileRef.name = data.displayName;
        profileRef.email = data.email;
        profileRef.lastSignIn = +new Date();
        profileRef.$save()
          .then(function () { ///ref) {
            $localStorage.profile = {id: profileRef.$id};
            return d.resolve(profileRef);
          }, function (err) {
            return d.reject(err);
          });
        return d.promise;
      }
      function logIn(id) {
        var d = $q.defer(),
          profileRef = getProfileRef(id);
        profileRef.$loaded()
          .then(function () {
            profileRef.lastSignIn = +new Date();
            profileRef.$save()
              .then(function () { ///ref) {
                $localStorage.profile = {id: profileRef.$id};
                profile = profileRef;
                return d.resolve(profileRef);
              }, function (err) {
                return d.reject(err);
              });
          }, function (err) {
            return d.reject(err);
          });
        return d.promise;
      }

      User.authenticate = function () {
        var d = $q.defer(),
          provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('email');
        provider.addScope('public_profile');
        firebase.auth()
          .signInWithPopup(provider)
          .then(function (authData) {
            /// log in or create user
            var thisProfile = getProfileRef(authData.user.providerData[0].uid);
            thisProfile.$loaded()
              .then(function (data) {
                if (!data.apiKey) { /// it's a new user
                  createUser(profile, authData.user.providerData[0])
                    .then(function (profileRef) {
                      profile = profileRef;
                      return d.resolve(profileRef);
                    }, function (err) {
                      return d.reject(err);
                    });
                } else {
                  logIn(thisProfile.$id)
                    .then(function (profileRef) {
                      profile = profileRef;
                      return d.resolve(profileRef);
                    }, function (err) {
                      return d.reject(err);
                    });
                }
              });
          }).catch(function (err) {
            return d.reject(err);
          });

        return d.promise;
      };

      User.update = function (obj) {
        var d = $q.defer();
        profile.$loaded()
          .then(function () {
            angular.extend(profile, obj);
            profile.$save()
              .then(function () {
                return d.resolve(profile);
              }, $q.reject);
          }, $q.reject);
        return d.promise;
      };

      User.getProfile = function () {
        var d = $q.defer();
        if (profile.email) {
          return $q.when(profile);
        }
        if (!$localStorage.profile || !$localStorage.profile.id) {
          d.reject({message: "No profile found. Try logging in."});
          return d.promise;
        }
        if ($localStorage.profile && $localStorage.profile.id) {
          logIn($localStorage.profile.id)
            .then(function (profileRef) {
              profile = profileRef;
              return d.resolve(profileRef);
            }, function (err) {
              return d.reject(err);
            });
          return d.promise;
        }
        return $q.when(profile);
      };
      User.logOut = function () {
        delete $localStorage.profile;
        profile = {};
      };

      return User;
    }
  ];

  angular.module('feed-me')
    .service('User', UserFact);
}());

///account.js
(function () {
  'use strict';
  var accountResolve = {
    'user': [
      'User',
      function (User) {
        return User.getProfile();
      }]
  },
    accountCtrl = [
      'user',
      'User',
      function (user, User) {
        var vm = this;
        vm.user = user;
        vm.updateForRealsies = function () {
          User.update({
            forRealsies: vm.user.forRealsies
          });
        };
      }],
    accountConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.account', {
            url: '/account',
            views: {
              'menuContent': {
                templateUrl: 'views/Home/account.html',
                controller: 'AccountCtrl as vm',
                resolve: accountResolve
              }
            }
          });
      }];
  angular.module('feed-me')
    .controller('AccountCtrl', accountCtrl)
    .config(accountConfig);
}());

/// home.Home.js
(function () {
  'use strict';
  var homeCtrl = [
    '$ionicLoading',
    'EatStreet',
    '$ionicPopup',
    '$state',
    'user',
    function ($ionicLoading, EatStreet, $ionicPopup, $state, user) {
      var vm = this;
      vm.people = 2;
      vm.amount = 20;
      vm.user = user;
      vm.budgetInfo = function () {
        $ionicPopup.alert({
          title: "Budget",
          template: "<p>Tell us how much you'd like to spend and we'll figure out the rest for you.</p><p>Note: We try really hard to get you the most food without going over budget, but it's possible with tax and delivery charges that the total amount will be a tiny bit over - we can only do as good as the data we're given by EatStreet. Thanks for your patience and understanding.</p>",
          okType: "button-balanced"
        });
      };
      vm.feedMe = function () {
        $ionicLoading.show();
        EatStreet.feedMe({
          people: vm.people,
          amount: parseInt(vm.amount, 10),
          forRealsies: vm.user.forRealsies
        })
          .then(function () { ///succ) {
            $state.go('app.status');
            $ionicLoading.hide();
          }, function (err) {
            $ionicLoading.hide();
            if (err.status === 1001) { /// additional info needed
              var templateString = "<p>We need more information from you before we can Feed You:</p>";
              if (err.address) {
                templateString += "<li>Delivery Address</li>";
              }
              if (err.card) {
                templateString += "<li>Payment Method</li>";
              }
              if (err.phone) {
                templateString += "<li>Phone Number</li>";
              }
              templateString += "<p class='margin-top'>Please visit <a ui-sref='app.settings'>Settings</a> to fix this issue. Thanks!</p>";
              $ionicPopup.alert({
                title: "Missing Information",
                template: templateString,
                okType: 'button-balanced'
              });
            } else {
              $ionicPopup.alert({
                title: "An Unknown Error Occurred",
                template: "Whoops! Sorry about that. Here's some debug info in case it's helpful: " + JSON.stringify(err)
              });
            }
          });
      };
      $ionicLoading.hide();
    }],
    homeResolve = {
      'user': [
        'User',
        function (User) {
          return User.getProfile();
        }
      ]
    },
    homeConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.home', {
            url: '/home',
            views: {
              'menuContent': {
                templateUrl: 'views/Home/home.html',
                controller: 'HomeCtrl as vm',
                resolve: homeResolve
              }
            }
          });
      }];
  angular.module('feed-me')
    .controller('HomeCtrl', homeCtrl)
    .config(homeConfig);
}());

// status.js
(function () {
  'use strict';
  var statusResolve = {
    'user': [
      'User',
      function (User) {
        return User.getProfile();
      }]
  },
    statusCtrl = [
      'user',
      'EatStreet',
      function (user, EatStreet) {
        var vm = this;
        vm.order = user.currentOrder;
        angular.noop(vm);
        EatStreet.getRestaurant(vm.order.restaurantApiKey)
          .then(function (restaurant) {
            vm.restaurant = restaurant;
          }, function (err) {
            vm.restaurant = false;
            if (!user.forRealsies) { /// fake it till you make it
              vm.restaurant = {
                "apiKey": "90fd4587554469b1459c89af9c680205d30b6aeaa238f8d1",
                "logoUrl": "https://eatstreet-static.s3.amazonaws.com/assets/images/restaurant_logos/88-china-authentic-chinese-4631_1400537432746.png",
                "name": "88 China - Authentic Chinese",
                "streetAddress": "608 University Avenue",
                "city": "Madison",
                "state": "WI",
                "zip": "53715",
                "latitude": 43.0732908179745,
                "longitude": -89.3961805764666
              };
            }
            console.warn(err);
          });
        EatStreet.getOrderStatus(vm.order.apiKey)
          .then(function (status) {
            if (status.status === "SENT") {
              status.statusCode = 0;
            } else if (status.status === "RECEIVED") {
              status.statusCode = 1;
            } else if (status.status === "OUT") {
              status.statusCode = 2;
            } else if (status.status === "DELIVERED") {
              status.statusCode = 3;
            }
            vm.status = status;
          }, function (err) {
            vm.status = false;
            if (!user.forRealsies) {
              vm.status = {
                "updated": "2016-06-30 04:28 PM CDT",
                "status": "SENT",
                statusCode: 0
              };
              vm.status.updated = new Date(vm.status.updated);
            }
            console.warn(err);
          });
      }],
    statusConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.status', {
            url: '/status/:id',
            views: {
              'menuContent': {
                templateUrl: 'views/Home/status.html',
                controller: 'StatusCtrl as vm',
                resolve: statusResolve
              }
            }
          });
      }];
  angular.module('feed-me')
    .controller('StatusCtrl', statusCtrl)
    .config(statusConfig);
}());

/// Login.User.js
(function () {
  'use strict';
  var loginCtrl = [
    '$state',
    'User',
    function ($state, User) {
      var vm = this;
      User.logOut();

      vm.signIn = function () {
        User.authenticate()
          .then(function (user) {
            if (user.onboarded) {
              $state.go('app.home');
            } else {
              $state.go('app.onboarding.phone');
            }
          }, function (err) {
            window.alert(err);
          });
      };
    }
  ],
    loginConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('login', {
            url: '/login',
            templateUrl: 'views/Login/login.User.html',
            controller: 'LoginCtrl as vm'
          });
      }];
  angular.module('User')
    .controller('LoginCtrl', loginCtrl)
    .config(loginConfig);
}());

/// Onboarding.js
(function () {
  'use strict';
  var OnboardingParentCtrl = [
    '$ionicLoading',
    function ($ionicLoading) {
      var parentVM = this;
      parentVM.step = 1;
      $ionicLoading.hide();
    }],
    OnboardingParentConfig = ['$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.onboarding', {
            url: '/onboarding',
            abstract: true,
            views: {
              'menuContent': {
                templateUrl: "views/Onboarding/Onboarding.html",
                controller: 'OnboardingParentController as parentVM'
              }
            }
          });
      }];
  angular.module('feed-me')
    .config(OnboardingParentConfig)
    .controller('OnboardingParentController', OnboardingParentCtrl);
}());

/// address.js
(function () {
  'use strict';
  var addressCtrl = [
    '$state',
    '$scope',
    '$ionicLoading',
    'User',
    'EatStreet',
    function ($state, $scope, $ionicLoading, User, EatStreet) {
      var vm = this,
        handleErr = function (err) {
          window.alert(err);
          $ionicLoading.hide();
        };
      $scope.parentVM.step = 2;
      vm.skip = function () {
        $state.go('app.onboarding.creditCard');
      };
      vm.continue = function () {
        if (!vm.details) {
          return false;
        }
        var components = vm.details.address_components;
        $ionicLoading.show();
        User.getProfile()
          .then(function (user) {
            EatStreet.addAddress({
              'user': user,
              'address': components[0].short_name + " " + components[1].long_name,
              'city': components[2].long_name,
              'state': components[4].short_name,
              'zip': components[6].short_name
            }).then(function () {
              $state.go('app.onboarding.creditCard');
            }, handleErr);
          }, handleErr);
      };
      $ionicLoading.hide();
    }],
    addressConfig = ['$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.onboarding.address', {
            url: '/address',
            views: {
              'onboarding': {
                templateUrl: "views/Onboarding/address.html",
                controller: "AddressController as vm"
              }
            }
          });
      }];

  angular.module('feed-me')
    .config(addressConfig)
    .controller('AddressController', addressCtrl);
}());

/// creditCard.js
(function () {
  'use strict';
  var creditCardCtrl = [
    '$state',
    '$scope',
    '$ionicLoading',
    'User',
    'EatStreet',
    function ($state, $scope, $ionicLoading, User, EatStreet) {
      var vm = this,
        handleErr = function (err) {
          window.alert(err);
          $ionicLoading.hide();
        };
      vm.monthList = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
      vm.yearList = ["16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36"];
      $scope.parentVM.step = 3;
      vm.skip = function () {
        $state.go('app.home');
      };
      vm.continue = function () {
        if (!vm.name || !vm.address || !vm.zip || !vm.cardNumber || !vm.cvv) {
          return false;
        }
        $ionicLoading.show();
        User.getProfile()
          .then(function (user) {
            EatStreet.addCard({
              'user': user,
              'name': vm.name,
              'address': vm.address,
              'zip': vm.zip,
              'cardNumber': vm.cardNumber,
              'cvv': vm.cvv,
              'expMonth': vm.expMonth,
              'expYear': vm.expYear
            }).then(function () {
              User.update({
                'onboarded': true
              });
              $state.go('app.home');
            }, handleErr);
          }, handleErr);
      };
      $ionicLoading.hide();
    }],
    creditCardConfig = ['$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.onboarding.creditCard', {
            url: '/creditCard',
            views: {
              'onboarding': {
                templateUrl: "views/Onboarding/creditCard.html",
                controller: "CreditCardController as vm"
              }
            }
          });
      }];

  angular.module('feed-me')
    .config(creditCardConfig)
    .controller('CreditCardController', creditCardCtrl);
}());

/// getPhone.js
(function () {
  'use strict';
  var getPhoneCtrl = [
    '$state',
    '$scope',
    'User',
    'EatStreet',
    '$ionicLoading',
    function ($state, $scope, User, EatStreet, $ionicLoading) {
      var vm = this,
        handleErr = function (err) {
          window.alert(err);
          $ionicLoading.hide();
        };
      $scope.parentVM.step = 1;
      vm.areaCode = '';
      vm.partOne = '';
      vm.partTwo = '';
      vm.disabled = true;
      vm.skip = function () {
        $state.go('app.onboarding.address');
      };
      vm.validate = function () {
        vm.disabled = true;
        if ((vm.areaCode.length === 3) &&
            (vm.partOne.length === 3) &&
            (vm.partTwo.length === 4)) {
          vm.disabled = false;
        }
      };
      vm.continue = function () {
        $ionicLoading.show();
        if (vm.disabled) {
          return false;
        }
        User.getProfile()
          .then(function (user) {
            EatStreet.createUser(user, vm.areaCode + vm.partOne + vm.partTwo)
              .then(function () {
                $state.go('app.onboarding.address');
              }, handleErr);
          }, handleErr);
      };
      $ionicLoading.hide();
    }],
    getPhoneConfig = ['$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.onboarding.phone', {
            url: '/phone',
            views: {
              'onboarding': {
                templateUrl: "views/Onboarding/getPhone.html",
                controller: "PhoneController as vm"
              }
            }
          });
      }];

  angular.module('feed-me')
    .config(getPhoneConfig)
    .controller('PhoneController', getPhoneCtrl);
}());
