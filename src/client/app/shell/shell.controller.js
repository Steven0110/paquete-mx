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

    $scope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
      if(toState.data && toState.data.access && !userApi.currentUser()){
        event.preventDefault();
        $state.go('login');
      }
    });
  };
})();