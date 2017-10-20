(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Logout',Logout);

  Logout.$inject = ['$scope','$state'];


  function Logout($scope,$state){
    // jshint validthis: true 
    var logout = this;
    var shell = $scope.shell;
    shell.logout();
  };
})();