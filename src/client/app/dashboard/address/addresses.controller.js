(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Addresses',Addresses);

  Addresses.$inject = ['$scope','$state','$q'];


  function Addresses($scope,$state, $q){
    // jshint validthis: true 
    var addresses = this;
    var shell = $scope.shell;
    
  };
})();