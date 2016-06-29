/// Login.User.js
(function () {
  'use strict';
  var loginCtrl = [
    '$state',
    'User',
    function ($state, User) {
      var vm = this;

      vm.signIn = function () {
        User.authenticate()
          .then(function (user) {
            if (user.onboarded) {
              $state.go('app.home');
            } else {
              $state.go('app.onboarding.phone');
            }
          }, function (err) {
            window.alert(err);
          });
      };
    }
  ],
    loginConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('login', {
            url: '/login',
            templateUrl: 'views/Login/login.User.html',
            controller: 'LoginCtrl as vm'
          });
      }];
  angular.module('User')
    .controller('LoginCtrl', loginCtrl)
    .config(loginConfig);
}());
