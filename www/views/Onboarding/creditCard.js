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
