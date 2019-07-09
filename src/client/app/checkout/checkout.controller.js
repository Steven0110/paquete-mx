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
    checkout.status = {
      "paying": false
    }

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
      var subtotal = parseFloat((parseFloat(checkout.shipping.service.discountTotal)/1.16).toFixed(2));
      var iva = parseFloat((subtotal * 0.16).toFixed(2));
      checkout.shipping.service.subtotal =  subtotal;
      checkout.shipping.service.iva =  iva;
      checkout.shipping.service.total = parseFloat(checkout.shipping.service.discountTotal);
      if(checkout.shipping.service.couponCode)
        if(checkout.shipping.service.percentageCoupon === true)
          checkout.shipping.service.total *= (1.00 - parseFloat(checkout.shipping.service.couponDiscount/100));
        else
          checkout.shipping.service.total -= checkout.shipping.service.couponDiscount;

      if(checkout.step == 'confirm' && checkout.shipping.service.cardComision)
        checkout.shipping.service.total += parseFloat(checkout.shipping.service.cardComision);
      else
        checkout.shipping.service.cardComision = false

      /*      New changes for subtotals and commissions     */
      var sale = parseFloat(checkout.shipping.service.discountTotal)
      var subtotal_cfdi
      if( checkout.shipping.service.cardComision )
        subtotal_cfdi = parseFloat(sale)/1.16 + parseFloat(sale)*0.032
      else
        subtotal_cfdi = parseFloat(sale)/1.16
      
      var iva_cfdi = parseFloat(subtotal_cfdi * 0.16)
      checkout.shipping.commission = parseFloat(checkout.shipping.service.cardComision || 0.00).toFixed(2)
      checkout.shipping.subtotal = parseFloat(subtotal_cfdi).toFixed(2)
      checkout.shipping.iva = parseFloat(iva_cfdi).toFixed(2)
      checkout.shipping.sale = parseFloat(sale).toFixed(2)
      checkout.shipping.cost = parseFloat(sale).toFixed(2)
      checkout.shipping.profit = 0
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

            /*  ¿Cupón porcentual?   */
            checkout.shipping.service.percentageCoupon = res.percentage;

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
      checkout.status.paying = true
      if(checkout.acceptTerms){

        shell.moveToTop();
         //Sólo para Venta al público en general que 
        userApi.getByUser(checkout.user).then(function(account){
          
          if(account){
            if(checkout.invoice == false){
              account.taxId = "XAXX010101000";
              account.taxName = "PÚBLICO EN GENERAL";
              return {"promise": accountApi.update(account), "account": account};
            }else return {"account": account};
          }else{
            Dialog.showError("Error al obtener la cuenta.","");
            return false;
          }
        }).then(function(response){
          //console.log(response.promise.$$state.status);
          //Creates order and shipment
            if(response.account){

              var total = checkout.shipping.service.total;

              /*  Fix empty company    */
              checkout.shipping.from.company = checkout.shipping.from.company || "N-A"
              checkout.shipping.to.company = checkout.shipping.to.company || "N-A"
              
              var order = {
                shipping:{
                  "packagingType"        : checkout.shipping.packagingType,
                  "service"              : checkout.shipping.service,
                  "from"                 : checkout.shipping.from,
                  "to"                   : checkout.shipping.to,
                  "packages"             : checkout.shipping.packages,
                  "content"              : checkout.shipping.content,
                  "estimated_value"      : checkout.shipping.estimated_value,
                  "RFCReceptor"          : response.account.taxId,
                  "RazonSocialReceptor"  : response.account.taxName,
                  "iva"                  : Number(checkout.shipping.iva),
                  "cost"                 : Number(checkout.shipping.cost),
                  "subtotal"             : Number(checkout.shipping.subtotal),
                  "sale"                 : Number(checkout.shipping.sale),
                  "profit"               : Number(checkout.shipping.profit),
                  "commission"           : Number(checkout.shipping.commission)
                },
                paymentMethod : {card: checkout.card},
                amount        : total
              }

              console.log("KB2");
              console.log(JSON.stringify(order))

              if(checkout.payment == 'card'){
                order.paymentMethod = {card: checkout.card};
              }else if(checkout.payment == 'account'){
                order.paymentMethod = 'account';
                checkout.shipping.service.cardComision = false;
              }

              checkout.connecting = true;
              rateApi.ship(order).then(function(response){
                console.log( response )
                checkout.trackingNumber = response.shipOrder.trackingNumber;
                checkout.response = true;
                checkout.labels = response.shipOrder.packages;
              },function(err){
                console.log(err)
                if(checkout.payment == 'account')
                  checkout.step = 'selectPayment';
                else if(checkout.payment == 'card'){
                  checkout.step = 'payment';
                  checkout.cardForm = false;
                }
                if(err.message){
                  var title = 'No se pudo pagar el envío.';
                  if(err.message == "Referirse al Emisor de la tarjeta" || err.message == "Not able to trace back to original transaction" || err.message == "Reservado para uso privado o Datos de Track Incorrectos")
                    err.message = "La transacción fue bloqueada por tu banco. Por favor comunícate con tu banco para que eliminen este bloqueo"
                  else if(err.message == "PaymentFilterException" )
                    err.message = "Tu tarjeta fue bloqueada temporalmente en nuestro sistema debido a la gran cantidad de intentos de pago realizados. Este bloqueo dura 24 horas."
                  else if(err.message == "Reservado para uso privado o no existe modulo de seguridad" || err.message == "MTT_ERROR")
                    err.message = "Transacción declinada por el banco. Esta tarjeta no puede ser usada para realizar este tipo de transacción online."
                  
                  Dialog.showError(err.message, title);
                }else if(err.code && err.code == -12345){
                  /*    Payment might be done but with no shipping    */
                  let title = 'Hubo un problema al realizar tu envío.',
                      message = "Por favor, envíanos un correo a atencion@paquete.mx para ayudarte a resolver el problema con tu envío"

                  Dialog.showError(message, title)

                  shippingApi.notifyError(order)
                  .then(response => console.log( response ))
                  .catch(err => console.error( response ))
                  
                }else if(err.result && err.result.detail){
                  let title = 'No se pudo pagar el envío.'
                  Dialog.showError(err.result.detail, title)
                }
              })
              .finally(function(){
                checkout.status.paying = false
                checkout.connecting = false;
              });

            }else{
              Dialog.showError("Ocurrió un problema al guardar tu envío.","Si el error persiste contacta a paquete@paquete.mx");
            }
        }, function(err){
          checkout.status.paying = false
          console.log(err);
        });
        
      }else{
        checkout.status.paying = false
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
        var auxTotal = checkout.shipping.service.total + checkout.shipping.service.total * amex
        var commission = auxTotal * amex
        checkout.shipping.service.cardComision = commission
        checkout.shipping.service.total += commission
        checkout.shipping.service.total = parseFloat(checkout.shipping.service.total).toFixed(2)
      }else{
        var auxTotal = checkout.shipping.service.total + checkout.shipping.service.total * visa
        var commission = auxTotal * visa
        checkout.shipping.service.cardComision = commission
        checkout.shipping.service.total += commission
        checkout.shipping.service.total = parseFloat(checkout.shipping.service.total).toFixed(2)
      }

      calculateTotals()
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