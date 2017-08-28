(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Shell',Shell);

  Shell.$inject = ['$scope','template','$mdToast','userApi'];


  function Shell($scope, template, $mdToast, userApi){
    // jshint validthis: true 
    var shell = this;
    shell.loading = false;
    shell.labels = false;


    template.get('app/lang/es.json').then(function(labels){
      shell.labels = labels;
    },function(err){
      console.log(err);
    });

    shell.showLoading = function(){
      shell.loading = true;
    };

    shell.showMessage = function(message){
      if(!message)
        message = "Actualización Exitosa.";
      showToast(message);
    }

    shell.showError = function(message){
      if(!message)
        message = "Hubo un error, recarga la página";
      showToast(message);
    }

    shell.setCurrentUser = function(user){
      userApi.setCurrentUser(user);
      shell.currentUser = user;
    };

    function showToast(message){
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position('top right')
          .hideDelay(3000)
      );
    }
  };
})();