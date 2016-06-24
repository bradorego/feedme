/// Login.User.js
(function () {
  'use strict';
  var loginCtrl = [
    '$state',
    function ($state) {
      var vm = this;

      vm.signIn = function () {
        $state.go('app.home');
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
