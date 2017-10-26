(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Payment',Payment);

  Payment.$inject = ['$scope','$q'];


  function Payment($scope, $q){
    // jshint validthis: true 
    var payment = this;
    var shell = $scope.shell;
  };
})();