(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Account',Account);

  Account.$inject = ['$scope','$q'];


  function Account($scope, $q){
    // jshint validthis: true 
    var account = this;
    var shell = $scope.shell;
  };
})();