(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Checkout',Checkout);

  Checkout.$inject = ['$scope','$q','$state','$timeout','rateApi','userApi','accountApi','shippingApi','Dialog','$ngConfirm'];

  function Checkout($scope, $q, $state, $timeout, rateApi, userApi,accountApi,shippingApi, Dialog, $ngConfirm){
    // jshint validthis: true 
    var checkout = this;
    var shell = $scope.shell;
    checkout.labels ={};
    checkout.labels.payment = shell.labels.paymentMethod;

    checkout.shipping = shell.getShipping();
    checkout.response = false;
    checkout.connecting = false;
    checkout.paymentMethods = [];
    checkout.taxInfo = {};
    // console.log('shipping',checkout.shipping);
    
    if(!checkout.shipping){
      shell.showMessage('Selecciona un servicio');
      $state.go('home');
    }

    checkout.goToPayment = function(){
      checkout.step = 'payment';
    }
    checkout.goToConfirm = function(){
      checkout.card = false;
      checkout.payment = 'account';
      checkout.step = 'confirm';
    }

    var saveInvoice = function(){
      
      if(checkout.taxInfo.taxId)
        checkout.taxInfo.taxId = checkout.taxInfo.taxId.toUpperCase();
      if(checkout.taxInfo.taxName)
        checkout.taxInfo.taxName = checkout.taxInfo.taxName.toUpperCase();

      var user = checkout.user;
      return userApi.updateTaxInfo(checkout.invoice, checkout.taxInfo).then(function(){
        return userApi.getCurrentUser();
      }).then(function(user){
        return userApi.setCurrentUser(user);
      });

    }

    checkout.taxUses = [{code:'G01',name:'Adquisición de mercancias'},{code:'G02',name:'Gastos en general'},{code:'P01',name:'Por definir'}];
    checkout.taxInfo.taxUse = checkout.taxUses[1].code;
    

    checkout.invoiceRequired = function(){
      if(checkout.invoice){
        // alert('factura requerida');
        $ngConfirm({
            title: 'Datos Fiscales',
            contentUrl: '/app/dashboard/invoice/invoice.form.html',
            scope: $scope,
            buttons: {
                continue: {
                    text: 'Continuar',
                    btnClass: 'btn-blue',
                    action: function(scope, button){
                      shell.showLoading();
                      saveInvoice().then(function(res){
                        console.log(res);
                      },function(err){
                        console.log(err);
                      }).finally(shell.hideLoading);
                    }
                },
                close: {
                  text : "Cancelar",
                  action: function(scope, button){
                    shell.showLoading();
                    checkout.invoice = false;
                    $scope.$apply();
                    saveInvoice().then(function(res){
                      console.log(res);
                    },function(err){
                      console.log(err);
                    }).finally(function(){
                      shell.hideLoading();
                    });


                  }
                }
            }
            
        });
      }else{
        // alert('factura no requerida');
        shell.showLoading();
        saveInvoice().then(function(res){
          console.log(res);
        },function(err){
          console.log(err);
        }).finally(shell.hideLoading);
      }
    }

    checkout.step = "from";
    checkout.user = false;

    $scope.setUser = function(user){
      shell.setCurrentUser(user);
      // alert('yeah');
    };

    $scope.loginSuccess = function(){
      checkout.user = shell.getCurrentUser();
      if(checkout.user){
        shell.moveToTop();
        getPaymentMethods();
      }else{
        checkout.step = 'login';  
      }
    }

    checkout.changeSection = function(section){
      if(section == "payment"){
        getPaymentMethods();
        checkout.cardForm = false;
      }
      shell.moveToTop();
      checkout.step = section;
    }

    checkout.cancelPayment =function(){
      checkout.cardForm = false;
    }

    checkout.paymentMethod = function(card){
      checkout.card = card;
      checkout.payment = 'card';
      checkout.step = 'confirm';
    }

    checkout.order = function(){
      var total = checkout.shipping.service.total;
      var order = {
        shipping:{
          packagingType : checkout.shipping.packagingType,
          service       : checkout.shipping.service,
          from          : checkout.shipping.from,
          to            : checkout.shipping.to,
          packages      : checkout.shipping.packages
        },
        paymentMethod : {card: checkout.card},
        amount        : total
      }

      if(checkout.payment == 'card'){
        order.paymentMethod = {card: checkout.card};
      }else if(checkout.payment == 'account'){
        order.paymentMethod = 'account';
      }

      console.log('order-shipping',order);
      checkout.connecting = true;
      rateApi.ship(order).then(function(response){
        checkout.trackingNumber = response.shipOrder.trackingNumber;
        console.log(response);
        checkout.response = true;
        checkout.labels = response.shipOrder.packages;
      },function(err){
        if(checkout.payment == 'account')
          checkout.step = 'selectPayment';
        else if(checkout.payment == 'card')
          checkout.step = 'payment';
        if(err.message){
          Dialog.showError(err.message, 'No se pudo pagar la orden.');
        }
      }).finally(function(){
        checkout.connecting = false;
      });
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
          // alert('login');
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

      // console.log(checkout.user.taxUse);
      // if(checkout.user){
      //   if(checkout.user.taxUse)
      //     checkout.taxInfo.taxUse = checkout.user.taxUse;
      //   if(checkout.user.taxName)
      //     checkout.taxInfo.taxName = checkout.user.taxName;
      //   if(checkout.user.taxId)
      //     checkout.taxInfo.taxId = checkout.user.taxId;
      //   checkout.invoice = checkout.user.invoice;
      // }

      console.log(checkout.user);
      accountApi.getByUser(checkout.user).then(function(account){
        console.log(account);
        if(account){
          checkout.account = account;
          return userApi.getCards();
        }
        else{
          alert("Invalid account");
        }
      }).then(function(result){
        console.log(result);
        checkout.cardForm = true;
        if(result && result.length > 0){
          checkout.paymentMethods = result;
          checkout.cardForm = false;
        }
        shell.hideLoading();
        $timeout(function(){
          if(checkout.account.type == 'personal'){
            checkout.step = 'payment';
          }else if(checkout.account.type == 'enterprise'){
            if(checkout.account.verified){
              checkout.step = 'selectPayment';
            }else{
              checkout.step = 'payment';
            }
          }
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