(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Checkout',Checkout);

  Checkout.$inject = ['$scope','$q','$state','$timeout','rateApi','conektaApi','shippingApi','Dialog'];

  function Checkout($scope, $q, $state, $timeout, rateApi, conektaApi,shippingApi, Dialog){
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

    checkout.paymentMethod = function(card){
      checkout.card = card;
      checkout.step = 'confirm';
    }

    checkout.order = function(){
      var order = {
        shipping:{
          service       : checkout.shipping.service,
          from          : checkout.shipping.from,
          to            : checkout.shipping.to,
          packages      : [checkout.shipping.package]
        },
        paymentMethod : {card: checkout.card},
        amount        : 10000
      }

      console.log('order-shipping',order);
      shell.showLoading();
      rateApi.ship(order).then(function(response){
        console.log(response);
      },function(err){
        console.log(err);
        checkout.step = 'payment';
        if(err.error && err.message){
          Dialog.showError(err.message, 'No se pudo cargar tu tarjeta.');
        }
      }).finally(shell.hideLoading);
    }

    checkout.fromAddress = function(response){
      if(response.result && response.data){
        checkout.shipping.from = response.data;
        shippingApi.setShipping(checkout.shipping);
        shell.moveToTop();
        $timeout(function(){
          checkout.step = 'to';
          console.log('to');
        },300)
      }
    }

    checkout.toAddress = function(response){
      if(response.result && response.data){
        checkout.shipping.to = response.data;

        shippingApi.setShipping(checkout.shipping);
        checkout.user = shell.getCurrentUser();

        if(checkout.user){
          shell.moveToTop();
          getPaymentMethods();
        }else{
          alert('login');
          checkout.step = 'login';  
        }
      }
    }

    checkout.selectCard = function(card){
      checkout.card = card;
      checkout.step = 'confirm';
    }

    var getPaymentMethods = function(){
      shell.showLoading();
      conektaApi.getCards().then(function(result){
        checkout.cardForm = true;
        if(result && result.length > 0){
          checkout.paymentMethods = result;
          checkout.cardForm = false;
        }
        shell.hideLoading();
        $timeout(function(){
          checkout.step = 'payment';
        },300);
      },function(err){
        console.log(err);
      }).finally(shell.hideLoading);
    }

    var validateUser = function(){
      var deferred =  $q.defer();
      var user = shell.getCurrentUser();
      deferre.resolve(user);
      return deferred.promise;
    }

  
  };
})();