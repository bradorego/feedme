///account.js
(function () {
  'use strict';
  var accountResolve = {
    'user': [
      'User',
      function (User) {
        return User.getProfile();
      }]
  },
    accountCtrl = [
      'user',
      'User',
      function (user, User) {
        var vm = this;
        vm.user = user;
        vm.updateForRealsies = function () {
          User.update({
            forRealsies: vm.user.forRealsies
          });
        };
      }],
    accountConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.account', {
            url: '/account',
            views: {
              'menuContent': {
                templateUrl: 'views/Home/account.html',
                controller: 'AccountCtrl as vm',
                resolve: accountResolve
              }
            }
          });
      }];
  angular.module('feed-me')
    .controller('AccountCtrl', accountCtrl)
    .config(accountConfig);
}());
