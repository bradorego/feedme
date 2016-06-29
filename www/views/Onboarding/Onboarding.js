/// Onboarding.js
(function () {
  'use strict';
  var OnboardingParentCtrl = [
    '$ionicLoading',
    function ($ionicLoading) {
      var parentVM = this;
      parentVM.step = 1;
      $ionicLoading.hide();
    }],
    OnboardingParentConfig = ['$stateProvider',
      function ($stateProvider) {
        $stateProvider
          .state('app.onboarding', {
            url: '/onboarding',
            abstract: true,
            views: {
              'menuContent': {
                templateUrl: "views/Onboarding/Onboarding.html",
                controller: 'OnboardingParentController as parentVM'
              }
            }
          });
      }];
  angular.module('feed-me')
    .config(OnboardingParentConfig)
    .controller('OnboardingParentController', OnboardingParentCtrl);
}());
