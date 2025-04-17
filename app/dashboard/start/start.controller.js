(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Start',Start);

  Start.$inject = ['$scope','$state','$q'];


  function Start($scope,$state, $q){
    // jshint validthis: true 
    var start = this;
    var shell = $scope.shell;
  };
})();