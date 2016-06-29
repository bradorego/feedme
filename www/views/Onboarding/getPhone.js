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
