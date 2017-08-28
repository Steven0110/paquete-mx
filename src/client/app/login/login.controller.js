(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Login',Login);

  Login.$inject = ['$scope','$q'];


  function Login($scope, $q){
    // jshint validthis: true 
    var login = this;
    var shell = $scope.shell;
  };
})();