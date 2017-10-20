(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Checkout',Checkout);

  Checkout.$inject = ['$scope','$q','$state','rateApi','shippingApi'];

  function Checkout($scope, $q, $state, rateApi, shippingApi){
    // jshint validthis: true 
    var checkout = this;
    var shell = $scope.shell;
    checkout.labels ={};
    checkout.labels.payment = shell.labels.paymentMethod;

    checkout.shipping = shell.getShipping();

    console.log('shipping',checkout.shipping);
    
    if(!checkout.shipping){
      shell.showMessage('Selecciona un servicio');
      $state.go('home');
    }

    checkout.step = "from";
    // checkout.from = false;
    // checkout.to = false;
    checkout.user = false;

    $scope.setUser = function(user){
      shell.setCurrentUser(user);
      alert('yeah');
    };

    checkout.paymentMethod = function(response){
      console.log(response);
      checkout.step = 'confirm';
    }



    checkout.order = function(){
      var order = {
        service   : checkout.shipping.service,
        from      : checkout.shipping.from,
        to        : checkout.shipping.to,
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
        checkout.shipping.from = response.data;
        console.log('shipping-from',checkout.shipping);
        shippingApi.setShipping(checkout.shipping);

        checkout.step = 'to';
      }
    }

    checkout.toAddress = function(response){
      if(response.result && response.data){
        checkout.shipping.to = response.data;

        shippingApi.setShipping(checkout.shipping);
        checkout.user = shell.getCurrentUser();

        if(checkout.user){
          checkout.step = 'payment';
        }else{
          alert('login');
          checkout.step = 'login';  
        }
      }
    }

    var validateUser = function(){
      var deferred =  $q.defer();
      var user = shell.getCurrentUser();
      deferre.resolve(user);
      return deferred.promise;
    }

  
  };
})();