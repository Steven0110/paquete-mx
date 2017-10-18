(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('PaymentMethod',PaymentMethod);

  PaymentMethod.$inject = ['$scope','$state','$q', 'data', 'conektaApi'];


  function PaymentMethod($scope,$state, $q, data, conektaApi){
    // jshint validthis: true 
    var paymentMethod = this;
    paymentMethod.list = [];
    var shell = $scope.shell;
    paymentMethod.labels = shell.labels.paymentMethod;
    paymentMethod.send =function(response){
      console.log(response);
    }

    if(data && data.length > 0){
      paymentMethod.list = data;
    }

    paymentMethod.showForm = function(value){
      paymentMethod.form = value;
    }

    paymentMethod.delete = function(item, index){
      console.log(item);
      if(item && item.id)
        conektaApi.remove(item.id).then(function(result){
          console.log(result);
        },function(err){
          console.log(err);
        });
    }


    
  };
})();