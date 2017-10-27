(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Shippings',Shippings);

  Shippings.$inject = ['$scope','data'];


  function Shippings($scope, data){
    // jshint validthis: true 
    var shippings = this;
    var shell = $scope.shell;

    var dashMenu = $('#dash-menu').innerWidth();
    $('.dashboard-menu').width(Math.floor(dashMenu-2));

    shippings.list = [];

    if(data){
      shippings.list = data;
    }
  };
})();