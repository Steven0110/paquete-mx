(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Enterprise',Enterprise);

  Enterprise.$inject = ['$scope','$state','$q','userApi','Upload','accountApi', '$http'];

  function Enterprise($scope,$state, $q, userApi, Upload, accountApi, $http){
    // jshint validthis: true 
    var enterprise = this;
    var shell = $scope.shell;

    enterprise.account;

    userApi.getByUser().then(function(res){
      enterprise.account = res;
    },function(err){
      console.log(err);
    });

    enterprise.loading ={'actaConstitutiva':0, 'INE':0, 'comprobanteDomicilio':0, 'constanciaFiscal':0, 'caratulaBancaria':0, 'autorizacionBuro':0}

    enterprise.upload = function (file, name) {
      if(file){
        
        enterprise.loading[name] = 50
        let type = "jpeg";
        
        if( file.type ){
          let array = file.type.split("/")
          if( array[ 1 ] )
            type = array[1]
        }

        let filename = name + "-" + enterprise.account.accountNo + "." + type
        let _file = new File([file], filename, {type: file.type})

        let path = "documents/"
        let formData = new FormData()
        formData.append("file", _file)
        formData.append("path", path)


        return $http.post("https://files.paquete.mx:2053/uploader", formData, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        }).success(function(response){

            enterprise.account[name] = filename
            let params = {
              objectId : enterprise.account.objectId
            }

            params[name] = filename
            accountApi.update(params).then(function(res){
              enterprise.loading[name] = 101;
            },function(err){
              console.log(err);
            });
        }).error(function( error ){
          console.log( error.message )
          alert("Hubo un error, carga tu archivo nuevamente. Si el error persiste por favor, contáctanos al email paquete@paquete.mx")
        })
      }else{
        alert('File invalid');
      }
    };

  };
})();