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
      function createUser(id, data) {
        var d = $q.defer(),
          profileRef = getProfileRef(id);

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
      function logIn(id) {
        var d = $q.defer(),
          profileRef = getProfileRef(id);
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
            var thisProfile = getProfileRef(authData.user.providerData[0].uid);
            thisProfile.$loaded()
              .then(function (data) {
                if (!data.apiKey) { /// it's a new user
                  createUser(profile, authData.user.providerData[0])
                    .then(function (profileRef) {
                      profile = profileRef;
                      return d.resolve(profileRef);
                    }, function (err) {
                      return d.reject(err);
                    });
                } else {
                  logIn(thisProfile.$id)
                    .then(function (profileRef) {
                      profile = profileRef;
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

      User.update = function (obj) {
        var d = $q.defer();
        profile.$loaded()
          .then(function () {
            angular.extend(profile, obj);
            profile.$save()
              .then(function () {
                return d.resolve(profile);
              }, $q.reject);
          }, $q.reject);
        return d.promise;
      };

      User.getProfile = function () {
        var d = $q.defer();
        if (profile.email) {
          return $q.when(profile);
        }
        if (!$localStorage.profile || !$localStorage.profile.id) {
          d.reject({message: "No profile found. Try logging in."});
          return d.promise;
        }
        if ($localStorage.profile && $localStorage.profile.id) {
          logIn($localStorage.profile.id)
            .then(function (profileRef) {
              profile = profileRef;
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

      return User;
    }
  ];

  angular.module('feed-me')
    .service('User', UserFact);
}());
