(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('PaymentMethod',PaymentMethod);

  PaymentMethod.$inject = ['$scope','$state','$q','userApi'];


  function PaymentMethod($scope,$state, $q, userApi){
    // jshint validthis: true 
    var paymentMethod = this;
    var shell = $scope.shell;
    
  };
})();