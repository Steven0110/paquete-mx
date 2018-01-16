(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Enterprise',Enterprise);

  Enterprise.$inject = ['$scope','$state','$q','userApi'];

  function Enterprise($scope,$state, $q, userApi){
    // jshint validthis: true 
    var enterprise = this;
    var shell = $scope.shell;

    enterprise.account;

    userApi.getByUser().then(function(res){
      enterprise.account = res;
    },function(err){
      console.log(err);
    });

  };
})();