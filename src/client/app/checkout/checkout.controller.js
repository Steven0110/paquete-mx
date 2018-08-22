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
    checkout.pickupConfirmation = false;
    
    if(checkout.shipping && checkout.shipping.service){
      calculateTotals();

    }else{
      shell.showMessage('Selecciona un servicio');
      $state.go('home');
    }

    $scope.$watch('checkout.step',function(newValue, oldValue){
      shell.moveToTop();
      if(newValue == 'selectPayment' || newValue =='payment'){
        calculateTotals();
      }
    });

    function calculateTotals(){
      console.log(checkout.shipping.service)
      var subtotal = parseFloat((parseFloat(checkout.shipping.service.discountTotal)/1.16).toFixed(2));
      var iva = parseFloat((subtotal * 0.16).toFixed(2));
      checkout.shipping.service.subtotal =  subtotal;
      checkout.shipping.service.iva =  iva;
      checkout.shipping.service.total = parseFloat(checkout.shipping.service.discountTotal);
      /*Cupón aplicado a total y no a originalAmount*/
      /*console.log(checkout.shipping.service.total);
      console.log(checkout.shipping.service.couponDiscount);
      console.log(parseFloat(checkout.shipping.service.couponDiscount/100));*/
      if(checkout.shipping.service.couponCode)
        checkout.shipping.service.total *= (1.00 - parseFloat(checkout.shipping.service.couponDiscount/100));

      if(checkout.step == 'confirm' && checkout.shipping.service.cardComision)
        checkout.shipping.service.total += parseFloat(checkout.shipping.service.cardComision);
      else
        checkout.shipping.service.cardComision = false
    }

    checkout.applyCoupon = function(){
      var coupon = checkout.shipping.coupon;
      if(coupon)
        coupon = coupon.trim();
      if(coupon && coupon !== ""){
        shell.showLoading();
        accountApi.validateCoupon(coupon).then(function(res){

          if(res && res.discount){
            
            var service = checkout.shipping.service;
            checkout.shipping.service.couponCode = coupon;
            checkout.shipping.service.couponDiscount = res.discount;
            service.prevDiscount = service.discountTotal;
            var discount = service.originalAmount*(res.discount/100);
            checkout.shipping.service.discountPrev = discount;
            //service.discountTotal =  service.originalAmount-discount;
            calculateTotals();
            shippingApi.setShipping(checkout.shipping);
          }
        },function(err){
          Dialog.showError("Verifica que tu cupón este bien escrito, es sensible a mayusculas y minusculas. Si tienes problemas contactanos en hola@paquete.mx", "¡Lo sentimos el cupón es invalido!",function(){
          });  
        }).finally(shell.hideLoading);
      }else{
        Dialog.showError("Ingresa el valor de tu cupón", "¡Lo sentimos el cupón es invalido!",function(){
        });
      }
    }

    checkout.goToPayment = function(){
      checkout.step = 'payment';
      checkout.payment = 'card';
    }
    checkout.goToConfirm = function(){
      checkout.card = false;
      checkout.payment = 'account';
      checkout.step = 'confirm';
    }

    checkout.shippingDesc = function(){
      if($scope.shippingDesc.$valid){
        shippingApi.setShipping(checkout.shipping);
        checkout.step = "to";
      }else{
        Dialog.showMessage();
      }
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
                        if(err && err.invalidTaxId){
                          Dialog.showError("La verificación con el SAT nos marco el RFC como inválido, verifica que este correcto y que este activo ante el SAT", "¡RFC INVALIDO!",function(){
                            checkout.invoiceRequired();
                          });
                        }
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
        shell.showLoading();
        saveInvoice().then(function(res){
          console.log(res);
        },function(err){
          console.log(err);
        }).finally(shell.hideLoading);
      }
    }


    //regresar a from
    checkout.step = "from";
    checkout.user = false;

    $scope.setUser = function(user){
      shell.setCurrentUser(user);
    };

    $scope.loginSuccess = function(){
      checkout.user = shell.getCurrentUser();
      shell.currentUser = checkout.user;
      if(checkout.user){
        shell.loginSuccess();
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
      // shell.moveToTop();
      checkout.step = section;
    }

    checkout.cancelPayment =function(){
      shell.moveToTop();
      checkout.cardForm = false;
    }

    checkout.paymentMethod = function(card){
      checkout.card = card;
      checkout.paymentMethods.push(card);
      checkout.payment = 'card';
      checkout.step = 'confirm';

      if(card && card.brand){
        var brand = card.brand;
        calculateComision(brand);
      }
    }

    checkout.order = function(){
      shell.moveToTop();
  
      if(checkout.acceptTerms){
        var total = checkout.shipping.service.total;
        var order = {
          shipping:{
            packagingType : checkout.shipping.packagingType,
            service       : checkout.shipping.service,
            from          : checkout.shipping.from,
            to            : checkout.shipping.to,
            packages      : checkout.shipping.packages,
            content       : checkout.shipping.content,
            estimated_value  : checkout.shipping.estimated_value,

          },
          paymentMethod : {card: checkout.card},
          amount        : total
        }

        if(checkout.payment == 'card'){
          order.paymentMethod = {card: checkout.card};
        }else if(checkout.payment == 'account'){
          order.paymentMethod = 'account';
          checkout.shipping.service.cardComision = false;
          // checkout.shipping.service.total = checkout.shipping.service.discountTotal;
        }

        checkout.connecting = true;
        rateApi.ship(order).then(function(response){
          checkout.trackingNumber = response.shipOrder.trackingNumber;
          console.log(response);
          checkout.response = true;
          checkout.labels = response.shipOrder.packages;
        },function(err){
          if(checkout.payment == 'account')
            checkout.step = 'selectPayment';
          else if(checkout.payment == 'card'){
            checkout.step = 'payment';
            checkout.cardForm = false;
          }
          if(err.message){
            var title = 'No se pudo pagar la orden.';
            if(err.message == 'Deny' || err.message == 'Denegado'){
              title = "Tarjeta Declianda";
              err.message = "Lo sentimos no se pudo completar la orden ya que tu tarjeta fue declinada, ponte en contacto con tu banco."
            }
            Dialog.showError(err.message, title);
          }
        }).finally(function(){
          checkout.connecting = false;
        });
      }else{
        Dialog.showError("Debes aceptar los términos y condiciones para continuar.","¡Solo un paso más!");
      }
      // },function(){});
    }

    checkout.fromAddress = function(response){
      if(response.result && response.data){
        checkout.shipping.from = response.data;
        shippingApi.setShipping(checkout.shipping);
        // shell.moveToTop();
        $timeout(function(){
          // checkout.step = 'to';
          checkout.step = 'contentDescription';
        },300)
      }
    }

    checkout.toAddress = function(response){
      if(response.result && response.data){
        checkout.shipping.to = response.data;

        shippingApi.setShipping(checkout.shipping);
        checkout.user = shell.getCurrentUser();

        if(checkout.user){
          // shell.moveToTop();
          getPaymentMethods();
        }else{
          // alert('login');
          checkout.step = 'login';  
        }
      }
    }

    checkout.selectCard = function(card){
      checkout.payment = 'card'
      checkout.card = card;
      checkout.step = 'confirm';

      if(card && card.brand){
        var brand = card.brand;
        calculateComision(brand);
      }
    }

    function calculateComision(brand){
      var amex = 0.04176;
      var visa = 0.03712;
      if(brand == "AMEX"){
        var comission = checkout.shipping.service.total*amex;
        comission = parseFloat(comission.toFixed(2));
        checkout.shipping.service.cardComision = comission
        checkout.shipping.service.total += comission;
      }else{
        var comission = checkout.shipping.service.total*visa;
        comission = parseFloat(comission.toFixed(2));
        checkout.shipping.service.cardComision = comission
        checkout.shipping.service.total += comission;
      }
    }


    var getPaymentMethods = function(){
      shell.showLoading();

      console.log(checkout.user);
      userApi.getByUser(checkout.user).then(function(account){
        
        if(account){
          checkout.account = account;
          checkout.invoice = checkout.account.invoice;

          if(checkout.account.taxId)
            checkout.taxInfo.taxId = checkout.account.taxId;
          if(checkout.account.taxName)
            checkout.taxInfo.taxName = checkout.account.taxName;
          if(checkout.account.taxUse)
            checkout.taxInfo.taxUse = checkout.account.taxUse;

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

    checkout.pickup = {};
    this.myDate = new Date();

    checkout.pickup.schedule = "08:00-19:00";
    checkout.pickup.date = new Date();
    checkout.today = new Date(
        this.myDate.getFullYear(),
        this.myDate.getMonth(),
        this.myDate.getDate()
      )


    checkout.sendPickUp = function(){
      if(checkout.pickupForm.$valid){
        shell.showLoading();
        var params = {
          date: checkout.pickup.date,
          schedule: checkout.pickup.schedule,
          trackingNumber: checkout.trackingNumber,
          packages : checkout.shipping.packages,
          carrier  : checkout.shipping.service.service
        };

        shippingApi.sendPickUp(params).then(function(res){
          console.log(res);
          if(res.confirmation){
            Dialog.showTooltip('Recolección solicitada','Tu recolección se solicito con éxito, confirmación: '+res.confirmation,{close:"Cerrar"});
            checkout.pickupConfirmation = res.confirmation;
          }
        },function(err){
          console.log(err);
          if(err.message){
            Dialog.showError(err.message,'No se pudo solicitar la recolección');
          }
        }).finally(shell.hideLoading);
      }else{
        Dialog.showMessage();
      }
    }

  
  };
})();