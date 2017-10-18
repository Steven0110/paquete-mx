(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('PaymentMethod',PaymentMethod);

  PaymentMethod.$inject = ['$scope','$state','$q', 'data'];


  function PaymentMethod($scope,$state, $q, data){
    // jshint validthis: true 
    var paymentMethod = this;
    var shell = $scope.shell;
    paymentMethod.labels = shell.labels.paymentMethod;
    paymentMethod.send =function(response){
      console.log(response);
    }

    if(data && data.length > 0){
      paymentMethod.list = data;
      console.log(paymentMethod.list);
    }

    paymentMethod.showForm = function(value){
      paymentMethod.form = value;
    }


    
  };
})();