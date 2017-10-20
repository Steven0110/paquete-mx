(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Checkout',Checkout);

  Checkout.$inject = ['$scope','$q','$state','rateApi'];

  function Checkout($scope, $q, $state, rateApi){
    // jshint validthis: true 
    var checkout = this;
    var shell = $scope.shell;


    checkout.shipping = shell.getShipping();
    
    console.log(checkout.shipping);
    if(!checkout.shipping){
      shell.showMessage('Selecciona un servicio');
      $state.go('home');
    }




    checkout.step = "from";
    checkout.from = false
    checkout.to = false





    checkout.order = function(){
      var order = {
        service   : checkout.shipping.service,
        from      : checkout.from,
        to        : checkout.to,
        packages  : [checkout.shipping.package]
      }

      console.log('order-shipping',order);
      rateApi.ship(order).then(function(response){
        console.log(response);
      },function(err){
        console.log(err);
      })
    }

    checkout.fromAddress = function(response){
      if(response.result && response.data){
        checkout.from = response.data;
        checkout.step = 'to';
      }
    }

    checkout.toAddress = function(response){
      if(response.result && response.data){
        checkout.to = response.data;
        checkout.step = 'payment';
      }
    }

  
  };
})();