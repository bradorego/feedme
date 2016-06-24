// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
(function () {
  'use strict';
  var appRun = [
    '$ionicPlatform',
    function ($ionicPlatform) {
      $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
          window.cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          window.cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          window.StatusBar.styleDefault();
        }
      });
    }],
    appConfig = [
      '$stateProvider',
      '$urlRouterProvider',
      function ($stateProvider, $urlRouterProvider) {
        $stateProvider
          .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'views/menu.html',
            controller: 'AppCtrl as appVM'
          });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/login');
      }],
    appCtrl = [
      '$scope',
      '$ionicModal',
      '$timeout',
      function ($scope, $ionicModal, $timeout) {

        // With the new view caching in Ionic, Controllers are only called
        // when they are recreated or on app start, instead of every page change.
        // To listen for when this page is active (for example, to refresh data),
        // listen for the $ionicView.enter event:
        //$scope.$on('$ionicView.enter', function(e) {
        //});

        // Form data for the login modal
        $scope.loginData = {};

        // Create the login modal that we will use later
        $ionicModal.fromTemplateUrl('templates/login.html', {
          scope: $scope
        }).then(function (modal) {
          $scope.modal = modal;
        });

        // Triggered in the login modal to close it
        $scope.closeLogin = function () {
          $scope.modal.hide();
        };

        // Open the login modal
        $scope.login = function () {
          $scope.modal.show();
        };

        // Perform the login action when the user submits the login form
        $scope.doLogin = function () {
          console.log('Doing login', $scope.loginData);

          // Simulate a login delay. Remove this and replace with your login
          // code if using a login system
          $timeout(function () {
            $scope.closeLogin();
          }, 1000);
        };
      }];
  angular.module('User', []);
  angular.module('Client', []);
  angular.module('Workout', []);
  angular.module('refit-trainer', ['ionic', 'User', 'Client', 'Workout'])
    .run(appRun)
    .config(appConfig)
    .controller('AppCtrl', appCtrl);
}());

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

///completedSession.Workout.js
(function () {
  'use strict';
  var completedSessionCtrl = [
    '$scope',
    function ($scope) {
      $scope.workout = [
        {name: "Partial Squat", completed: true},
        {name: "Partial Squat", completed: false},
        {name: "Partial Squat", completed: true},
        {name: "Partial Squat", completed: true}
      ];
    }],
    completedSessionConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.completedSession', {
            url: '/completedSession',
            views: {
              'menuContent': {
                templateUrl: 'views/Session/completedSession.Workout.html',
                controller: 'CompletedSessionCtrl as vm'
              }
            }
          });
      }];
  angular.module('Workout')
    .controller('CompletedSessionCtrl', completedSessionCtrl)
    .config(completedSessionConfig);
}());

///addWorkout.Workout.js
(function () {
  'use strict';
  var addWorkoutCtrl = [
    '$scope',
    '$ionicPopup',
    function ($scope, $ionicPopup) {
      var i = 0;
      $scope.exercises = [{
        title: "Partial Squat"
      }];
      $scope.data = {};
      $scope.removeExercise = function (exerciseName) {
        for (i = 0; i < $scope.exercises.length; i++) {
          if ($scope.exercises[i].title === exerciseName) {
            $scope.exercises.splice(i, 1);
            return;
          }
        }
      };
      $scope.addExercise = function () {
        $ionicPopup.show({
          scope: $scope,
          title: "Add Exercise",
          template: '<p>Name<input type="text" placeholder="Exercise Name" ng-model="data.exerciseName"></p>' +
            '<p>You will be taken to your device’s camera app to record video. Videos are limited to 30 seconds.</p>',
          buttons: [{
            text: "Cancel",
            type: "button-dark"
          }, {
            text: "Record",
            type: "button-positive",
            onTap: function () { ///e) {
              return $scope.data.exerciseName;
            }
          }]
        }).then(function () { ///res) {
          $scope.exercises.push({title: $scope.data.exerciseName});
          $scope.data.exerciseName = '';
        });
      };
    }],
    addWorkoutConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.addWorkout', {
            url: '/addWorkout',
            views: {
              'menuContent': {
                templateUrl: 'views/Workout/addWorkout.Workout.html',
                controller: 'AddWorkoutCtrl as vm'
              }
            }
          });
      }];
  angular.module('Workout')
    .controller('AddWorkoutCtrl', addWorkoutCtrl)
    .config(addWorkoutConfig);
}());

///workout.Workout.js
(function () {
  'use strict';
  var workoutCtrl = [
    '$scope',
    function ($scope) {
      $scope.group = {
        name: 'Exercises',
        items: [
          {name: 'Partial Squat'},
          {name: 'Partial Squat'}
        ]
      };

      /*
       * if given group is the selected group, deselect it
       * else, select the given group
       */
      $scope.toggleGroup = function (group) {
        if ($scope.isGroupShown(group)) {
          $scope.shownGroup = null;
        } else {
          $scope.shownGroup = group;
        }
      };
      $scope.isGroupShown = function (group) {
        return $scope.shownGroup === group;
      };
    }],
    workoutConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.workout', {
            url: '/workout',
            views: {
              'menuContent': {
                templateUrl: 'views/Workout/workout.Workout.html',
                controller: 'WorkoutCtrl as vm'
              }
            }
          });
      }];
  angular.module('Workout')
    .controller('WorkoutCtrl', workoutCtrl)
    .config(workoutConfig);
}());

/// Login.User.js
(function () {
  'use strict';
  var loginCtrl = [
      function () {
        angular.noop();
      }
    ],
    loginConfig = [
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('login', {
            url: '/login',
            templateUrl: 'views/Login/login.User.html',
            controller: 'LoginCtrl as vm'
          });
      }];
  angular.module('User')
    .controller('LoginCtrl', loginCtrl)
    .config(loginConfig);
}());
