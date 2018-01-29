(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Shipping',Shipping);

  Shipping.$inject = ['$scope','data','shippingApi','Dialog'];


  function Shipping($scope, data, shippingApi, Dialog){
    // jshint validthis: true 
    var shipping = this;
    shipping.updates = [];
    shipping.overWeight = [];
    var shell = $scope.shell;
    shipping.pickup = {};
    var dashMenu = $('#dash-menu').innerWidth();
    $('.dashboard-menu').width(Math.floor(dashMenu-2));

    shipping.invoices = [];


    shipping.labels = shell.labels.shipping;

    if(data){
      shipping.data = data;
      shipping.packages = data.service.packages;

      console.log(data.objectId);
      shippingApi.getInvoices(data.objectId).then(function(res){
        if(res && res.length > 0){
          shipping.invoices = res;
        }
      },function(err){
        console.log(err);
      });
    }

    this.myDate = new Date();

    shipping.pickup.schedule = "08:00-19:00";
    shipping.pickup.date = new Date();
    shipping.today = new Date(
        this.myDate.getFullYear(),
        this.myDate.getMonth(),
        this.myDate.getDate()
      )


    shipping.cancelPickup = function(){
      shell.showLoading();
      var params = {
        trackingNumber: shipping.data.trackingNumber,
        carrier  : shipping.data.carrier
      }
      shippingApi.cancelPickup(params).then(function(res){
        console.log(res);
        if(res.confirmation){
          Dialog.showTooltip('Recolección cancelada','Tu recolección se cancelo con éxito',{close:"Cerrar"});
          shipping.data.pickupConfirmation = res.confirmation;
        }
      },function(err){
        console.log(err);
        if(err.message){
          Dialog.showError(err.message,'No se pudo solicitar la recolección');
        }
      }).finally(shell.hideLoading);
    }

    shipping.sendPickUp = function(){
      if(shipping.pickupForm.$valid){
        shell.showLoading();
        var params = {
          date: shipping.pickup.date,
          schedule: shipping.pickup.schedule,
          trackingNumber: shipping.data.trackingNumber,
          packages : shipping.data.packages,
          carrier  : shipping.data.carrier
        };

        shippingApi.sendPickUp(params).then(function(res){
          console.log(res);
          if(res.confirmation){
            Dialog.showTooltip('Recolección solicitada','Tu recolección se solicito con éxito, confirmación: '+res.confirmation,{close:"Cerrar"});
            shipping.data.pickupConfirmation = res.confirmation;
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

    shipping.onlyWeekPredicate = function(date){
      var day = date.getDay();
      return day > 0 && day < 6;
    }
  };
})();