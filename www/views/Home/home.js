/// home.Home.js
(function () {
  'use strict';
  var homeCtrl = [
    '$ionicLoading',
    '$timeout',
    'EatStreet',
    'User',
    '$ionicPopup',
    function ($ionicLoading, $timeout, EatStreet, User, $ionicPopup) {
      var vm = this;

      vm.people = 2;
      vm.amount = 25;
      $ionicLoading.show();

      $ionicPopup.alert({
        title: "Test",
        template: "Test!"
      });

      vm.feedMe = function () {
        $ionicLoading.show();
        EatStreet.placeOrder({
          people: vm.people,
          amount: vm.amount
        })
          .then(function (succ) {
            $ionicLoading.hide();
          }, function (err) {
            $ionicLoading.hide();
            if (err.status === 1001) { /// additional info needed
              if (err.address) {

              }
              if (err.creditCard) {

              }
              if (err.phoneNumber) {

              }
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
