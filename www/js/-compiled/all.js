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
            $state.go('login').then(function (data) {
              console.log(data);
            }, function (err) {
              console.warn(err);
            });
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
            })
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

      EatStreet.addCreditCard = function () {
        if (!initialized) {
          EatStreet.init();
        }
        angular.noop();
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
      function createUser(profileRef, data) {
        var d = $q.defer();
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
      function logIn(profileRef) {
        var d = $q.defer();
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
            profile = getProfileRef(authData.user.providerData[0].uid);
            profile.$loaded()
              .then(function (data) {
                if (!data.id) { /// it's a new user
                  createUser(profile, authData.user.providerData[0])
                    .then(function (profileRef) {
                      return d.resolve(profileRef);
                    }, function (err) {
                      return d.reject(err);
                    });
                } else {
                  logIn(profile, authData.user.providerData[0])
                    .then(function (profileRef) {
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
        if (!profile.$id && (!$localStorage.profile || !$localStorage.profile.id)) {
          d.reject({message: "No profile found. Try logging in."});
          return d.promise;
        }
        if (!profile.$id && ($localStorage.profile && $localStorage.profile.id)) {
          profile = getProfileRef($localStorage.profile.id);
          logIn(profile)
            .then(function (profileRef) {
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

/// home.Home.js
(function () {
  'use strict';
  var homeCtrl = [
    '$ionicLoading',
    'EatStreet',
    '$ionicPopup',
    function ($ionicLoading, EatStreet, $ionicPopup) {
      var vm = this;
      vm.people = 2;
      vm.amount = 25;
      vm.feedMe = function () {
        $ionicLoading.show();
        EatStreet.placeOrder({
          people: vm.people,
          amount: vm.amount
        })
          .then(function (succ) {
            angular.noop(succ);
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
    }],
    homeConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.home', {
            url: '/home',
            views: {
              'menuContent': {
                templateUrl: 'views/Home/home.html',
                controller: 'HomeCtrl as vm'
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
  var statusCtrl = [
    function () {
      var vm = this;

      angular.noop(vm);
    }],
    statusConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.status', {
            url: '/status',
            views: {
              'menuContent': {
                templateUrl: 'views/Home/status.html',
                controller: 'StatusCtrl as vm'
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
    function ($state, $scope) {
      var vm = this;
      $scope.parentVM.step = 3;
      vm.areaCode = '';
      vm.partOne = '';
      vm.partTwo = '';
      vm.disabled = true;
      vm.skip = function () {
        $state.go('app.home');
      };
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
