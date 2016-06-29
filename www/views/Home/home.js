/// home.Home.js
(function () {
  'use strict';
  var homeCtrl = [
    '$ionicLoading',
    '$timeout',
    'EatStreet',
    'User',
    '$ionicPopup',
    '$scope',
    function ($ionicLoading, $timeout, EatStreet, User, $ionicPopup, $scope) {
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
