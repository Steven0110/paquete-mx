angular
  .module('app.core')
  .directive('addressForm',addressForm);

addressForm.$inject = ['userApi'];

function addressForm(userApi){
  return{
    restrict: 'EA',
    templateUrl: 'app/directives/address/address.form.html',
    scope: {
      labels    : "=",
      countries : "=",
      showForm  : "&",
      sendForm  : "&",
      loading   : "&"
    },
    link:function(scope,element,attr){

      scope.cities = [];
      scope.county = {};

      scope.$watch('county',function(newVal, oldVal){
        if(newVal){
          if(newVal.county){
            scope.newAddress.county = newVal.county;
          }

          if(newVal.zip){
            scope.newAddress.zip = newVal.zip;
          }

          if(newVal.city){
            scope.newAddress.city = newVal.city;
          }

          if(newVal.state){
            scope.newAddress.state = newVal.state;
          }
        }

      });
      if(scope.countries && scope.countries[0])
        scope.country = scope.countries[0]

      scope.newAddress = {
        alias: "Nueva dirección",
        country:{},
        street:"Hamburgo",
        number: "70",
        apt:"201",
        county:"Juarez",
        city: "Cuauhtemoc",
        state:"Ciudad de México",
        zip: null
      };

      scope.hideForm = function(){
        console.log(scope.showForm);
        scope.showForm({value:false});
      }

      scope.send = function(){
        if(scope.addressForm.$valid){
          scope.loading();
          if(!scope.newAddress.zip){
            scope.newAddress.zip = scope.search;
          }
          var country ={
            code  : scope.newAddress.country.code,
            name  : scope.newAddress.country.name
          }
          scope.newAddress.country = country;
          userApi.saveAddress(scope.newAddress).then(function(data){
            scope.sendForm({response:{result:true, data:data}});
          },function(err){
            if(err.noSession == true){
              scope.sendForm({response:{noSession:true}});
            }else{
              scope.sendForm({response:err});
            }
          });
        }else{
          scope.sendForm({response:{error:true,message:scope.labels.form.errors.fields}});
        }
      }
    }
  };
}