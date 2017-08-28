(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Login',Login);

  Login.$inject = ['$scope','$state','$q'];


  function Login($scope,$state, $q){
    // jshint validthis: true 
    var login = this;
    var shell = $scope.shell;

    $scope.setUser = function(user){
      shell.setCurrentUser(user);
      $state.go('dashboard.profile');
    };
  };
})();