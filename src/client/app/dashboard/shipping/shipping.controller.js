(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Shipping',Shipping);

  Shipping.$inject = ['$scope','$q'];


  function Shipping($scope, $q){
    // jshint validthis: true 
    var shipping = this;
    var shell = $scope.shell;
  };
})();