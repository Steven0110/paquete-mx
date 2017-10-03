(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Addresses',Addresses);

  Addresses.$inject = ['$scope','$state','$q','userApi'];


  function Addresses($scope,$state, $q, userApi){
    // jshint validthis: true 
    var addresses = this;
    var shell = $scope.shell;

    var dashMenu = $('#dash-menu').innerWidth();
    $('.dashboard-menu').width(Math.floor(dashMenu-2));

    addresses.list =[];
    addresses.form = false;


    userApi.getAddresses().then(function(response){
      console.log(response);
      if(response)
        addresses.list = response;
    },function(err){
      console.log(err);
    });

    addresses.showForm = function(value){
      addresses.form = value;
    }

    addresses.delete = function(item, index){
      shell.showLoading();
      userApi.deleteAddress(item.objectId).then(function(response){
        console.log(response);
        addresses.list.splice(index,1);
      },function(err){
        console.log(err);
      }).finally(shell.hideLoading);
    }

    addresses.edit = function(item){
      console.log(item);
    }

    addresses.send = function(response){
      if(response.noSession == true){
        shell.noSession();
      }
      else if(response.error && response.message){
        shell.showError(response.message)
      }else if(response.data){
        console.log(response.data);
        if(response.data.objectId){
          // addresses.list.splice(0,0,response.data);
          addresses.list.push(response.data);
        }
      }else{
        console.log(response);
      }

      shell.hideLoading();
    }
    
  };
})();