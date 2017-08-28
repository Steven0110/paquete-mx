(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Shell',Shell);

  Shell.$inject = ['$scope','$mdToast'];


  function Shell($scope, $mdToast){
    // jshint validthis: true 
    var shell = this;
  };
})();