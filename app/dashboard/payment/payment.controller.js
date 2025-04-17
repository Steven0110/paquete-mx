(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Payments',Payments);

  Payments.$inject = ['$scope','$q','userApi','data'];


  function Payments($scope, $q, userApi, data){
    // jshint validthis: true 
    var payments = this;
    var shell = $scope.shell;
    payments.list = [];

    var dashMenu = $('#dash-menu').innerWidth();
    $('.dashboard-menu').width(Math.floor(dashMenu-2));

    if(data){
      payments.list = data;
    }

    console.log(payments.list);
  };
})();