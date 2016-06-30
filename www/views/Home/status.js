// status.js
(function () {
  'use strict';
  var statusResolve = {
    'user': [
      'User',
      function(User) {
        return User.getProfile();
      }]
    },
    statusCtrl = [
      'user',
      function (user) {
        var vm = this;
        console.log(user);
        vm.user = user;
        angular.noop(vm);
      }],
    statusConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.status', {
            url: '/status',
            views: {
              'menuContent': {
                templateUrl: 'views/Home/status.html',
                controller: 'StatusCtrl as vm'
              }
            }
          });
      }];
  angular.module('feed-me')
    .controller('StatusCtrl', statusCtrl)
    .config(statusConfig);
}());
