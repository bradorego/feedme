// User.js
/*global firebase*/
(function () {
  'use strict';
  var UserFact = [
    '$firebaseObject',
    '$q',
    '$localStorage',
    function ($firebaseObject, $q, $localStorage) {
      var User = {},
        ref = firebase.database().ref(),
        profile = {},
        getProfileRef = function (id) {
          return $firebaseObject(ref.child('users').child(id));
        };
      function createUser(profileRef, data) {
        var d = $q.defer();
        profileRef.$id = data.uid;
        profileRef.name = data.displayName;
        profileRef.email = data.email;
        profileRef.lastSignIn = +new Date();
        profileRef.$save()
          .then(function () { ///ref) {
            $localStorage.profile = {id: profileRef.$id};
            return d.resolve(profileRef);
          }, function (err) {
            return d.reject(err);
          });
        return d.promise;
      }
      function logIn(profileRef) {
        var d = $q.defer();
        profileRef.$loaded()
          .then(function () {
            profileRef.lastSignIn = +new Date();
            profileRef.$save()
              .then(function () { ///ref) {
                $localStorage.profile = {id: profileRef.$id};
                profile = profileRef;
                return d.resolve(profileRef);
              }, function (err) {
                return d.reject(err);
              });
          }, function (err) {
            return d.reject(err);
          });
        return d.promise;
      }

      User.authenticate = function () {
        var d = $q.defer(),
          provider = new firebase.auth.FacebookAuthProvider();
        provider.addScope('email');
        provider.addScope('public_profile');
        firebase.auth()
          .signInWithPopup(provider)
          .then(function (authData) {
            /// log in or create user
            profile = getProfileRef(authData.user.providerData[0].uid);
            profile.$loaded()
              .then(function (data) {
                if (!data.id) { /// it's a new user
                  createUser(profile, authData.user.providerData[0])
                    .then(function (profileRef) {
                      return d.resolve(profileRef);
                    }, function (err) {
                      return d.reject(err);
                    });
                } else {
                  logIn(profile, authData.user.providerData[0])
                    .then(function (profileRef) {
                      return d.resolve(profileRef);
                    }, function (err) {
                      return d.reject(err);
                    });
                }
              });
          }).catch(function (err) {
            return d.reject(err);
          });

        return d.promise;
      };

      User.getProfile = function () {
        var d = $q.defer();
        if (!profile.$id && (!$localStorage.profile || !$localStorage.profile.id)) {
          d.reject({message: "No profile found. Try logging in."});
          return d.promise;
        }
        if (!profile.$id && ($localStorage.profile && $localStorage.profile.id)) {
          profile = getProfileRef($localStorage.profile.id);
          logIn(profile)
            .then(function (profileRef) {
              return d.resolve(profileRef);
            }, function (err) {
              return d.reject(err);
            });
          return d.promise;
        }
        return $q.when(profile);
      };
      User.logOut = function () {
        delete $localStorage.profile;
        profile = {};
      };

      User.create = function (object) {
        angular.noop(object);
      };

      return User;
    }
  ];

  angular.module('feed-me')
    .service('User', UserFact);
}());
