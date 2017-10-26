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
            // shell.showMessage();
            shell.updateCurrentUser();
          },function(error){
            console.log(error);
            // shell.setError();
            // shell.showMessage(error);
          }).finally(shell.hideLoading);
        }else{
          Dialog.showMessage();
          // shell.showError('Verifica los campos requeridos.');
        }
      };


  };
})();