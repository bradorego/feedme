/// home.Home.js
(function () {
  'use strict';
  var homeCtrl = [
    '$ionicLoading',
    'EatStreet',
    '$ionicPopup',
    '$state',
    function ($ionicLoading, EatStreet, $ionicPopup, $state) {
      var vm = this;
      vm.people = 2;
      vm.amount = 20;
      vm.budgetInfo = function () {
        $ionicPopup.alert({
          title: "Budget",
          template: "<p>Tell us how much you'd like to spend and we'll figure out the rest for you.</p><p>Note: We try really hard to get you the most food without going over budget, but it's possible with tax and delivery charges that the total amount will be a tiny bit over - we can only do as good as the data we're given by EatStreet. Thanks for your patience and understanding.</p>",
          okType: "button-balanced"
        });
      };
      vm.feedMe = function () {
        $ionicLoading.show();
        EatStreet.feedMe({
          people: vm.people,
          amount: parseInt(vm.amount, 10)
        })
          .then(function (succ) {
            console.log(succ);
            $state.go('app.status');
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
            } else {
              $ionicPopup.alert({
                title: "An Unknown Error Occurred",
                template: "Whoops! Sorry about that. Here's some debug info in case it's helpful: " + JSON.stringify(err)
              });
            }
          });
      };
      $ionicLoading.hide();
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
