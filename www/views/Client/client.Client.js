/// client.Client.js
(function () {
  'use strict';
  var clientCtrl = [
    '$scope',
    function ($scope) {
      $scope.workouts = [
        {title: "Knee Strengthening", exercises: 4, completions: 7, comments: 5, reminder: true, lastCompleted: "33m ago"},
        {title: "Knee Strengthening", exercises: 4, completions: 7, comments: 5, reminder: true, lastCompleted: "33m ago"},
        {title: "Knee Strengthening", exercises: 4, completions: 7, comments: 5, reminder: true, lastCompleted: "33m ago"},
        {title: "Knee Strengthening", exercises: 4, completions: 7, comments: 5, reminder: true, lastCompleted: "33m ago"}
      ];
    }],
    clientConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.client', {
            url: '/client',
            views: {
              'menuContent': {
                templateUrl: 'views/Client/client.Client.html',
                controller: 'ClientCtrl as vm'
              }
            }
          });
      }];
  angular.module('Client')
    .controller('ClientCtrl', clientCtrl)
    .config(clientConfig);
}());
