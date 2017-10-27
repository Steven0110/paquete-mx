(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Account',Account);

  Account.$inject = ['$scope','userApi','Dialog'];


  function Account($scope, userApi, Dialog){
    // jshint validthis: true 
    var account = this;
    var shell = $scope.shell;

    var dashMenu = $('#dash-menu').innerWidth();
    $('.dashboard-menu').width(Math.floor(dashMenu-2));

    account.labels = shell.labels.account;

    var currentUser = shell.getCurrentUser();
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
          // shell.setError();
          // shell.showMessage(error);
        }).finally(shell.hideLoading);
      }else{
        Dialog.showMessage();
      }
    };

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