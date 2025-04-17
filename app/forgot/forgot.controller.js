(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Forgot',Forgot);

  Forgot.$inject = ['$scope','$q','userApi','Dialog'];


  function Forgot($scope, $q,userApi, Dialog){
    // jshint validthis: true 
    var forgot = this;
    var shell = $scope.shell;
    forgot.success = false;

    forgot.send = function(){
      if($scope.recoveryForm.$valid){
        shell.showLoading();
        userApi.recovery(forgot.username).then(function(res){
          if(res.recovery){
            forgot.success = true;
          }
        },function(err){
          if(err && err.data && err.data.error && err.data.error.registered == false){
            var title = "Correo no registrado";
            var message = "Verifica que tu correo electrónico sea con el que te hayas registrado en PAQUETE MX";
            Dialog.showError(message, title);
          }
          console.log(err);
        }).finally(shell.hideLoading);
      }else{
        Dialog.showMessage();
      }
    }
  };
})();