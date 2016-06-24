// status.js
(function () {
  'use strict';
  var statusCtrl = [
    function () {
      var vm = this;


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
