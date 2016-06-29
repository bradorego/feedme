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
