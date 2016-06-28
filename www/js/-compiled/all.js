// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
(function () {
  'use strict';
  var appRun = [
    '$ionicPlatform',
    '$rootScope',
    '$state',
    'User',
    '$ionicLoading',
    '$http',
    '$timeout',
    function ($ionicPlatform, $rootScope, $state, User, $ionicLoading, $http, $timeout) {
      var stateTimeout = {};
      User.getProfile()
        .then(function (data) {
          if (!data.id) {
            return $state.go('login');
          }
          $rootScope.profile = data;
          // if (data.trainer) {
          //   return $state.go('app.clientList');
          // }
          // return $state.go('app.client', {id: data.clientId});
        }, function () { ///err) {
          return $state.go('login');
        });
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
            controller: 'AppCtrl as appVM'
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
  angular.module('feed-me', ['ionic', 'User', 'ngStorage', 'firebase'])
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
      var EatStreet = {};

      EatStreet.init = function () {
        ESApi.init(ES_API_KEY);
      };

      EatStreet.createUser = function (obj) {
        var user = {
          'email': obj.email,
          'password': Math.random().toString(36).substr(-12),
          'firstName': obj.firstName,
          'lastName': obj.lastName,
          'phone': obj.phoneNumber
        },
          d = $q.defer();
        ESApi.registerUser(user, function (newUser) {
          User.update({
            phone: user.phone,
            password: user.password,
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

      EatStreet.addCreditCard = function () {
        angular.noop();
      };

      return EatStreet;
    }
  ];

  angular.module('feed-me')
    .service('EatStreet', ESFact);
}());

// User.js
(function () {
  'use strict';
  var UserFact = [
    '$firebaseAuth',
    '$firebaseObject',
    'FB_ROOT',
    '$q',
    '$localStorage',
    function ($firebaseAuth, $firebaseObject, FB_ROOT, $q, $localStorage) {
      var User = {},
        ref = firebase.database().ref(),
        auth = $firebaseAuth(),
        profile = {},
        getProfileRef = function (id) {
          return $firebaseObject(ref.child('users').child(id));
        };
      function createUser(profileRef, data) {
        var d = $q.defer();
        profileRef.id = data.uid;
        if (data.facebook) { /// we can pull their FB info
          profileRef.name = data.facebook.displayName;
          profileRef.email = data.facebook.email;
        }
        profileRef.lastSignIn = +new Date();
        profileRef.$save()
          .then(function () { ///ref) {
            $localStorage.profile = profileRef;
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
                $localStorage.profile = profileRef;
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
        var d = $q.defer();

        auth.$authWithOAuthRedirect("facebook")
          .then(function (authData) {
            /// log in or create user
            profile = getProfileRef(authData.uid);
            profile.$loaded()
              .then(function (data) {
                if (!data.id) { /// it's a new user
                  createUser(profile, authData)
                    .then(function (profileRef) {
                      return d.resolve(profileRef);
                    }, function (err) {
                      return d.reject(err);
                    });
                } else {
                  logIn(profile, authData)
                    .then(function (profileRef) {
                      return d.resolve(profileRef);
                    }, function (err) {
                      return d.reject(err);
                    });
                }
              });
          }).catch(function (error) {
            // console.log("Authentication failed:", error);
            return d.reject(error);
          });

        return d.promise;
      };

      User.getProfile = function () {
        var d = $q.defer();
        if (!profile.id && !$localStorage.profile) {
          d.reject({message: "No profile found. Try logging in."});
          return d.promise;
        }
        if (!profile.id && $localStorage.profile) {
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

      User.create = function (object) {
        angular.noop();
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
    '$timeout',
    function ($ionicLoading, $timeout) {
      var vm = this;

      vm.people = 2;
      vm.amount = 25;

      vm.feedMe = function () {
        $ionicLoading.show();
        $timeout(function () {
          $ionicLoading.hide();
        }, 5000);
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
    function ($state) {
      var vm = this;

      vm.signIn = function () {
        $state.go('app.home');
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
