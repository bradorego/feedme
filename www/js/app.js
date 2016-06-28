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
          // if (data.trainer) {
          //   return $state.go('app.clientList');
          // }
          // return $state.go('app.client', {id: data.clientId});
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
  angular.module('feed-me', ['ionic', 'User', 'ngStorage', 'firebase'])
    .run(appRun)
    .config(appConfig)
    .controller('AppCtrl', appCtrl)
    .value('FB_ROOT', 'https://feed-me-madison.firebaseio.com')
    .value('ES_API_KEY', '8e525b5783313f3f');
}());
