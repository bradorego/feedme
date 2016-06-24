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
    function ($ionicPlatform, $rootScope, $state) {
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
      $rootScope.signOut = function () {
        $state.go('login');
      };
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
    .value('FB_URL', 'https://feed-me-madison.firebaseio.com')
    .value('ES_API_KEY', '');
}());
