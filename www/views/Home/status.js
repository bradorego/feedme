// status.js
(function () {
  'use strict';
  var statusResolve = {
    'user': [
      'User',
      function (User) {
        return User.getProfile();
      }]
  },
    statusCtrl = [
      'user',
      'EatStreet',
      function (user, EatStreet) {
        var vm = this;
        vm.order = user.currentOrder;
        angular.noop(vm);
        EatStreet.getRestaurant(vm.order.restaurantApiKey)
          .then(function (restaurant) {
            vm.restaurant = restaurant;
          }, function (err) {
            vm.restaurant = false;
            if (!user.forRealsies) { /// fake it till you make it
              vm.restaurant = {
                "apiKey": "90fd4587554469b1459c89af9c680205d30b6aeaa238f8d1",
                "logoUrl": "https://eatstreet-static.s3.amazonaws.com/assets/images/restaurant_logos/88-china-authentic-chinese-4631_1400537432746.png",
                "name": "88 China - Authentic Chinese",
                "streetAddress": "608 University Avenue",
                "city": "Madison",
                "state": "WI",
                "zip": "53715",
                "latitude": 43.0732908179745,
                "longitude": -89.3961805764666
              };
            }
            console.warn(err);
          });
        EatStreet.getOrderStatus(vm.order.apiKey)
          .then(function (status) {
            if (status.status === "SENT") {
              status.statusCode = 0;
            } else if (status.status === "RECEIVED") {
              status.statusCode = 1;
            } else if (status.status === "OUT") {
              status.statusCode = 2;
            } else if (status.status === "DELIVERED") {
              status.statusCode = 3;
            }
            vm.status = status;
          }, function (err) {
            vm.status = false;
            if (!user.forRealsies) {
              vm.status = {
                "updated": "2016-06-30 04:28 PM CDT",
                "status": "SENT",
                statusCode: 0
              };
              vm.status.updated = new Date(vm.status.updated);
            }
            console.warn(err);
          });
      }],
    statusConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.status', {
            url: '/status/:id',
            views: {
              'menuContent': {
                templateUrl: 'views/Home/status.html',
                controller: 'StatusCtrl as vm',
                resolve: statusResolve
              }
            }
          });
      }];
  angular.module('feed-me')
    .controller('StatusCtrl', statusCtrl)
    .config(statusConfig);
}());
