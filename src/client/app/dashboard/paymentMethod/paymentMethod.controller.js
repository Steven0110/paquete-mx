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

    paymentMethod.labels = shell.labels.paymentMethod;

    // paymentMethod.card = {};
    // paymentMethod.card = {
    //     name       : "Carlos Canizal Zuñiga",
    //     number     : "4242424242424242",
    //     cvc        : "123",
    //     expMonth  : 1,
    //     expYear   : 2018
    // }

    paymentMethod.send =function(response){
      console.log(response);
    }
    
  };
})();