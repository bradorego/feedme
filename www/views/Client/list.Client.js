///list.Client.js
(function () {
  'use strict';
  var clientListCtrl = [
    '$scope',
    '$ionicPopup',
    function ($scope, $ionicPopup) {
      $scope.clients = [
        {name: "Brad Orego", workoutCount: 4, lastActive: "2 Days Ago"},
        {name: "Brad Orego", workoutCount: 4, lastActive: "2 Days Ago"},
        {name: "Brad Orego", workoutCount: 4, lastActive: "2 Days Ago"},
        {name: "Brad Orego", workoutCount: 4, lastActive: "2 Days Ago"},
        {name: "Brad Orego", workoutCount: 4, lastActive: "2 Days Ago"}
      ];
      $scope.addClient = function () {
        $ionicPopup.show({
          title: "Add Client",
          template: '<p>Client Name<input type="text" placeholder="Client Name"></p>' +
            '<p>Client Email<input type="text" placeholder="Client Email"></p>' +
            '<p>Your client will receive an email invitation from us notifying them of your invitation to join ReFit.</p>',
          buttons: [{
            text: "Cancel",
            type: "button-dark"
          }, {
            text: "Save",
            type: "button-positive"
          }]
        });
      };
    }
  ],
    clientListConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.clients', {
            url: '/clients',
            views: {
              'menuContent': {
                templateUrl: 'views/Client/list.Client.html',
                controller: 'ClientListCtrl as vm'
              }
            }
          });
      }];
  angular.module('Client')
    .controller('ClientListCtrl', clientListCtrl)
    .config(clientListConfig);
}());
