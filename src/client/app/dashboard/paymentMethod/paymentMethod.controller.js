(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('PaymentMethod',PaymentMethod);

  PaymentMethod.$inject = ['$scope','$state','$q','data','paymentGateway','Dialog'];


  function PaymentMethod($scope,$state, $q, data, paymentGateway, Dialog){
    // jshint validthis: true 
    var paymentMethod = this;
    paymentMethod.list = [];

    var dashMenu = $('#dash-menu').innerWidth();
    $('.dashboard-menu').width(Math.floor(dashMenu-2));
    
    var shell = $scope.shell;
    paymentMethod.labels = shell.labels.paymentMethod;
    paymentMethod.send =function(card){
      if(card && card.token)
        paymentMethod.list.push(card)
      else
        console.error(card);
    }

    if(data && data.length > 0){
      paymentMethod.list = data;
    }

    paymentMethod.showForm = function(value){
      paymentMethod.form = value;
    }

    paymentMethod.delete = function(item, index){
      if(paymentMethod.list.length > 1){
        var title ={main:"Eliminar Tarjeta",secondary:"He verificado mi información."};
        var content ={main:"¿Seguro que deseas eliminar esta tarjeta?"};
        var buttons ={main:{continue:"SI, Eliminar",cancel:"NO, Cancelar"},secondary:{continue:"Crear Etiqueta",cancel:"No, cancelar"}};
        Dialog.confirmDialog(title,content,buttons, function(){
          shell.showLoading();
          if(item && item.objectId){
            shell.showLoading();
            paymentGateway.remove(item.objectId).then(function(result){
              paymentMethod.list.splice(index,1);
            },function(err){
              console.log(err);
            }).finally(shell.hideLoading);
          }
        },function(){});
      }else{
        Dialog.showError("No es posible eliminar esta tarjeta. Debes tener al menos una en caso de validaciones de sobrepeso. Agrega otra tarjeta para eliminar esta.", "Agrega otra tarjeta");
      }
    }
  };
})();