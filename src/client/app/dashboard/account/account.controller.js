(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Account',Account);

  Account.$inject = ['$scope','userApi','accountApi','Dialog'];


  function Account($scope, userApi,accountApi, Dialog){
    // jshint validthis: true 
    var account = this;
    var shell = $scope.shell;

    var dashMenu = $('#dash-menu').innerWidth();
    $('.dashboard-menu').width(Math.floor(dashMenu-2));

    account.labels = shell.labels.account;

    var currentUser = shell.getCurrentUser();
    account.taxes = {};
    account.taxUses = [{code:'G01',name:'Adquisición de mercancias'},{code:'G02',name:'Gastos en general'},{code:'P01',name:'Por definir'}];
    account.taxes.taxUse = account.taxUses[1].code;

    if(currentUser){
      userApi.getByUser(currentUser).then(function(result){
        if(result){
          if(result.objectId)
            account.taxes.objectId = result.objectId;
          if(result.taxId)
            account.taxes.taxId = result.taxId;
          if(result.taxName)
            account.taxes.taxName = result.taxName;
          if(result.taxUse)
            account.taxes.taxUse = result.taxUse;
          account.taxes.invoice = result.invoice;
        }
      },function(err){
        console.log(err);
      })
    }

    account.user = {
      objectId  : currentUser.objectId,
      name      : currentUser.name,
      lastname  : currentUser.lastname,
      phone     : currentUser.phone,
      username  : currentUser.username
    }

    account.updateProfile = function(){
      if(account.profile.$valid){
        shell.showLoading();
        userApi.updateProfile(account.user).then(function(user){
          console.log(user);
          shell.showMessage();
          shell.updateCurrentUser();
        },function(error){
          console.log(error);
        }).finally(shell.hideLoading);
      }else{
        Dialog.showMessage();
      }
    };

    account.updateTaxes = function(){
      if(account.taxForm.$valid){

        shell.showLoading();
        accountApi.validateTaxId(account.taxes.taxId).then(function(res){
          if(res && res.valid){
            return accountApi.update(account.taxes).then(function(){
              shell.showMessage();
            });
          }else{
            Dialog.showError("La verificación con el SAT nos marco el RFC como inválido, verifica que este correcto y que este activo ante el SAT", "¡RFC INVALIDO!");
          }
        },function(err){
          console.log(err);
        }).finally(shell.hideLoading);
      }else{
        Dialog.showMessage();
      }
    }

    account.updatePassword = function(){
      if(account.password.$valid){
        shell.showLoading();
        var oldPassword = account.oldPassword;
        var newPassword = account.newPassword;
        userApi.updatePassword(account.user,oldPassword, newPassword).then(function(user){
          
          account.newPassword = null;
          account.oldPassword = null;
          $scope.passwordMatch = null;

          account.password.$setPristine();
          account.password.$setUntouched();

          account.password.confirmPassword.$setPristine();
          account.password.confirmPassword.$setUntouched();

          userApi.setSessionByToken(user.sessionToken);
          // shell.showMessage('Acutalización Exitosa');
          return shell.updateCurrentUser();
        }).then(function(user){
          console.log(user);
          // shell.setMessage('passwordSuccess');
          shell.showMessage();
        },function(error){
          console.log(error);
          // shell.showError();
          // shell.setError(error);
        }).finally(shell.hideLoading);
      }else{
        // shell.showMessage('Verifica los campos requeridos.');
        Dialog.showMessage();
      }
    };


  };
})();