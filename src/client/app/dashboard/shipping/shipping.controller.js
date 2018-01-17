(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Shipping',Shipping);

  Shipping.$inject = ['$scope','data','shippingApi'];


  function Shipping($scope, data, shippingApi){
    // jshint validthis: true 
    var shipping = this;
    shipping.updates = [];
    shipping.overWeight = [];
    var shell = $scope.shell;
    shipping.pickup = {};
    var dashMenu = $('#dash-menu').innerWidth();
    $('.dashboard-menu').width(Math.floor(dashMenu-2));


    shipping.labels = shell.labels.shipping;

    if(data){
      shipping.data = data;
      shipping.packages = data.service.packages;
    }

    this.myDate = new Date();
    shipping.today = new Date(
        this.myDate.getFullYear(),
        this.myDate.getMonth(),
        this.myDate.getDate()
      )

    shipping.pickup.schedule = "09:00-19:00";
    shipping.pickup.date = new Date();
    shipping.today = new Date(
        this.myDate.getFullYear(),
        this.myDate.getMonth(),
        this.myDate.getDate()
      )

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
            shipping.data.pickupConfirmation = res.confirmation;
          }
        },function(err){
          console.log(err);
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