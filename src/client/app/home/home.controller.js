(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Home',Home);

  Home.$inject = ['$scope','$q'];


  function Home($scope, $q){
    // jshint validthis: true 
    var home = this;
    var shell = $scope.shell;


  };
})();