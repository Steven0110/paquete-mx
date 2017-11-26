(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Shipping',Shipping);

  Shipping.$inject = ['$scope','data'];


  function Shipping($scope, data){
    // jshint validthis: true 
    var shipping = this;
    shipping.updates = [];
    shipping.overWeight = [];
    var shell = $scope.shell;

    var dashMenu = $('#dash-menu').innerWidth();
    $('.dashboard-menu').width(Math.floor(dashMenu-2));


    shipping.labels = shell.labels.shipping;

    if(data){
      shipping.data = data;
      shipping.packages = data.service.packages;
    }
  };
})();