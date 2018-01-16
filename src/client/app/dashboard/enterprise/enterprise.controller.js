(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Enterprise',Enterprise);

  Enterprise.$inject = ['$scope','$state','$q','userApi','Upload','accountApi'];

  function Enterprise($scope,$state, $q, userApi, Upload, accountApi){
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

          var type = "jpeg";
          if(file.type){
            var array = file.type.split("/");
            if(array[1])
              type = array[1];
          }

        var filename = name+"-"+enterprise.account.accountNo+"."+type;
        Upload.upload({
            url: 'https://s3-us-west-2.amazonaws.com/paquetemx', //S3 upload url including bucket name
            method: 'POST',
            data: {
              //FVn0wM6hCadAOni3aft/wmyGX6S67t8LctWnnc1D
                key:'documents/'+filename, // the key to store the file on S3, could be file name or customized
                AWSAccessKeyId: "AKIAJQ3WWGDWKZNWPYDA",
                acl: 'public-read', // sets the access to the uploaded file in the bucket: private, public-read, ...
                policy: "ewogICJleHBpcmF0aW9uIjogIjIwMjAtMDEtMDFUMDA6MDA6MDBaIiwKICAiY29uZGl0aW9ucyI6IFsKICAgIHsiYnVja2V0IjogInBhcXVldGVteCJ9LAogICAgWyJzdGFydHMtd2l0aCIsICIka2V5IiwgIiJdLAogICAgeyJhY2wiOiAicHVibGljLXJlYWQifSwKICAgIFsic3RhcnRzLXdpdGgiLCAiJENvbnRlbnQtVHlwZSIsICIiXSwKICAgIFsic3RhcnRzLXdpdGgiLCAiJGZpbGVuYW1lIiwgIiJdLAogICAgWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsIDAsIDUyNDI4ODAwMF0KICBdCn0=",
                signature: "5Es4dIUwChwch/+bt7NtIkd2QDg=", // base64-encoded signature based on policy string (see article below)
                "Content-Type": file.type != '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
                filename: file.name, // this is needed for Flash polyfill IE8-9
                file: file
            }
        }).then(function (resp) {
            var params ={
              objectId : enterprise.account.objectId,
            }
            params[name] = filename;
            accountApi.update(params).then(function(res){
              enterprise.loading[name] = 101;
            },function(err){
              console.log(err);
            });
        }, function (resp) {
            alert("Hubo un error carga tu archvio nuevamente");
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            enterprise.loading[name] = progressPercentage;
        });
      }else{
        alert('File invalid');
      }
    };

  };
})();