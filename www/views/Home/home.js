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
