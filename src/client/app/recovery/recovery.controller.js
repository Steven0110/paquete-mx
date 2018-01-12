(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Recovery',Recovery);

  Recovery.$inject = ['$scope','$state','$q','userApi','Dialog'];

  function Recovery($scope,$state, $q,userApi, Dialog){
    // jshint validthis: true 
    var recovery = this;
    var shell = $scope.shell;
    recovery.state = false;
    recovery.verified = false;
    recovery.success = false;

    var recoveryKey = false;
    if($state.params.recoveryKey){
      recovery.key = $state.params.recoveryKey;
      
      userApi.getKey(recovery.key).then(function(res){
        recovery.state = true;
        recovery.verified = true;
      },function(err){
        recovery.state = false;
        recovery.verified = true;
      });


      if(!recovery.key || recovery.key=="" || recovery.key==null || recovery.key==undefined){
        $state.go('login');
      }
    }else{
      $state.go('login');
    }


    recovery.updatePassword = function(){
      if($scope.passwordForm.$valid){
        var params = {
          recoveryKey: recovery.key,
          password: recovery.newPassword
        }

        userApi.setPassword(params)
        .then(function(res){
          recovery.success = true;
        },function(err){
          console.log(err);
        });
      }else{
        Dialog.showMessage();
      }
    }


  };
})();