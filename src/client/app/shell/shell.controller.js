(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Shell',Shell);

  Shell.$inject = ['$scope','$state','template','$mdToast','userApi'];


  function Shell($scope, $state,template, $mdToast, userApi){
    // jshint validthis: true 
    var shell = this;
    shell.loading = false;
    shell.loaded = false;
    shell.labels = false;

    shell.regex = {
      zip       : /^\d{5}$/,
      mobile    : /^\d{10}$/,
      decimal   : /^\d+(\.\d{1,2})?$/
    }


    template.get('app/lang/es.json').then(function(labels){
      shell.labels = labels;
    },function(err){
      console.log(err);
    });

    shell.showLoading = function(){
      shell.loading = true;
    };

    shell.hideLoading = function(){
      shell.loading = false;
    };

    shell.setLoaded = function(status){
      shell.loaded = status;
    }

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

    shell.logout = function(){
      userApi.logout();
      shell.currentUser = null;
      $state.go('home');
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