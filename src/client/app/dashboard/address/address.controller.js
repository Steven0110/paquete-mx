(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Address',Address);

  Address.$inject = ['$scope','$state','$q','userApi','data'];


  function Address($scope,$state, $q, userApi, data){
    // jshint validthis: true 
    var address = this;
    var shell = $scope.shell;

    var dashMenu = $('#dash-menu').innerWidth();
    $('.dashboard-menu').width(Math.floor(dashMenu-2));

    if(data){
      console.log(data);
      address.data =  data;
    }else{
      $state.go('dashboard.address');
    }

    address.delete = function(){
      shell.showLoading();
      userApi.deleteAddress(data.objectId).then(function(response){
        console.log(response);
        $state.go('dashboard.address');
      },function(err){
        console.log(err);
      }).finally(shell.hideLoading);
    }


    address.cancel = function(){
      $state.go('dashboard.address');
    }

    address.send = function(response){
      if(response.noSession == true){
        shell.noSession();
      }
      else if(response.error && response.message){
        shell.showError(response.message)
      }else if(response.data){
        console.log(response.data);
        if(response.data.objectId){
          $state.go('dashboard.address');
        }
      }else{
        console.log(response);
      }

      shell.hideLoading();
    }
    
  };
})();