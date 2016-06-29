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
