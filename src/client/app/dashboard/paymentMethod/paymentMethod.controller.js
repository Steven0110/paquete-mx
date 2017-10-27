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

    var dashMenu = $('#dash-menu').innerWidth();
    $('.dashboard-menu').width(Math.floor(dashMenu-2));
    
    var shell = $scope.shell;
    paymentMethod.labels = shell.labels.paymentMethod;
    paymentMethod.send =function(card){
      if(card && card.id)
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
      alert(index);
      console.log(item);
      if(item && item.id)
        shell.showLoading();
        conektaApi.remove(item.id).then(function(result){
          console.log(result);
          paymentMethod.list.splice(index,1);
        },function(err){
          console.log(err);
        }).finally(shell.hideLoading);
    }


    
  };
})();