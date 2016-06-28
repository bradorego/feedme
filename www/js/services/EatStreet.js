// EatStreet.js
/*global  ESApi */
(function () {
  'use strict';
  var ESFact = [
    'ES_API_KEY',
    '$q',
    'User',
    function (ES_API_KEY, $q, User) {
      var EatStreet = {};

      EatStreet.init = function () {
        ESApi.init(ES_API_KEY);
      };

      EatStreet.createUser = function (obj) {
        var user = {
          'email': obj.email,
          'password': Math.random().toString(36).substr(-12),
          'firstName': obj.firstName,
          'lastName': obj.lastName,
          'phone': obj.phoneNumber
        },
          d = $q.defer();
        ESApi.registerUser(user, function (newUser) {
          User.update({
            phone: user.phone,
            password: user.password,
            apiKey: newUser.apiKey
          })
            .then(function () { ///resp) {
              return d.resolve(user);
            }, function (err) {
              /// ruh roh
              return d.reject(err);
            });
          console.log(newUser);
        });
        return d.promise;
      };

      EatStreet.addCreditCard = function () {
        angular.noop();
      };

      return EatStreet;
    }
  ];

  angular.module('feed-me')
    .service('EatStreet', ESFact);
}());
