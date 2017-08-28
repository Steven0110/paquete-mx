(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Forgot',Forgot);

  Forgot.$inject = ['$scope','$q'];


  function Forgot($scope, $q){
    // jshint validthis: true 
    var forgot = this;
    var shell = $scope.shell;
  };
})();