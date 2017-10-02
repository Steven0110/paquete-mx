(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Addresses',Addresses);

  Addresses.$inject = ['$scope','$state','$q','userApi'];


  function Addresses($scope,$state, $q, userApi){
    // jshint validthis: true 
    var addresses = this;
    var shell = $scope.shell;

    var dashMenu = $('#dash-menu').innerWidth();
    $('.dashboard-menu').width(Math.floor(dashMenu-2));

    addresses.list =[];
    addresses.form = false;

    userApi.getAddresses().then(function(response){
      console.log(response);
      if(response)
        addresses.list = response;
    },function(err){
      console.log(err);
    });

    addresses.showForm = function(value){
      addresses.form = value;
    }


    
  };
})();