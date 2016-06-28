// User.js
(function () {
  'use strict';
  var UserFact = [
    '$firebaseAuth',
    '$firebaseObject',
    'FB_ROOT',
    '$q',
    '$localStorage',
    function ($firebaseAuth, $firebaseObject, FB_ROOT, $q, $localStorage) {
      var User = {},
        ref = firebase.database().ref(),
        auth = $firebaseAuth(),
        profile = {},
        getProfileRef = function (id) {
          return $firebaseObject(ref.child('users').child(id));
        };
      function createUser(profileRef, data) {
        var d = $q.defer();
        profileRef.id = data.uid;
        if (data.facebook) { /// we can pull their FB info
          profileRef.name = data.facebook.displayName;
          profileRef.email = data.facebook.email;
        }
        profileRef.lastSignIn = +new Date();
        profileRef.$save()
          .then(function () { ///ref) {
            $localStorage.profile = profileRef;
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
                $localStorage.profile = profileRef;
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
        var d = $q.defer();

        auth.$authWithOAuthRedirect("facebook")
          .then(function (authData) {
            /// log in or create user
            profile = getProfileRef(authData.uid);
            profile.$loaded()
              .then(function (data) {
                if (!data.id) { /// it's a new user
                  createUser(profile, authData)
                    .then(function (profileRef) {
                      return d.resolve(profileRef);
                    }, function (err) {
                      return d.reject(err);
                    });
                } else {
                  logIn(profile, authData)
                    .then(function (profileRef) {
                      return d.resolve(profileRef);
                    }, function (err) {
                      return d.reject(err);
                    });
                }
              });
          }).catch(function (error) {
            // console.log("Authentication failed:", error);
            return d.reject(error);
          });

        return d.promise;
      };

      User.getProfile = function () {
        var d = $q.defer();
        if (!profile.id && !$localStorage.profile) {
          d.reject({message: "No profile found. Try logging in."});
          return d.promise;
        }
        if (!profile.id && $localStorage.profile) {
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

      User.create = function (object) {
        angular.noop();
      };

      return User;
    }
  ];

  angular.module('feed-me')
    .service('User', UserFact);
}());
