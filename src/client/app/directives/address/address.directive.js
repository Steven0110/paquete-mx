angular
  .module('app.core')
  .directive('addressForm',addressForm);

addressForm.$inject = ['userApi','$state','$ngConfirm','Dialog'];

function addressForm(userApi,$state,$ngConfirm,Dialog){
  return{
    restrict: 'EA',
    templateUrl: 'app/directives/address/address.form.html',
    scope: {
      labels          : "=",
      countries       : "=",
      currentAddress  : "=",
      showForm        : "&",
      cancel          : "&",
      sendForm        : "&",
      loading         : "&",
      type            : "@"
    },
    link:function(scope,element,attr){

      scope.cities = [];
      scope.county = {};

      scope.regex ={
        mobile    : /^\d{10}$/
      }

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

      if(scope.currentAddress){
        scope.search = scope.currentAddress.zip;
        scope.newAddress = {
          objectId: scope.currentAddress.objectId,
          name: scope.currentAddress.name,
          company: scope.currentAddress.company,
          phone: scope.currentAddress.phone,
          email: scope.currentAddress.email,
          country:scope.currentAddress.country,
          street:scope.currentAddress.street,
          number: scope.currentAddress.number,
          apt:scope.currentAddress.apt,
          county:scope.currentAddress.county,
          city: scope.currentAddress.city,
          state: scope.currentAddress.state,
          zip: scope.currentAddress.zip
        };
      }else{
        scope.newAddress = {
          alias: null,
          country:{},
          street: null,
          number: null,
          apt: null,
          county: null,
          city: null,
          state: null,
          zip: null
        };
      }

      // scope.hideForm = function(){
      //   console.log(scope.showForm);
      //   scope.showForm({value:false});
      // }

      // alert(scope.type);

      scope.hideForm =  function(){
        scope.cancel();
      }
      scope.showZipMessage = function(){
        $ngConfirm({
            theme: 'supervan',
            title: "Cambiar Código Postal",
            content: "No puedes cambiar el código postal ni el País ya que se realizo una cotización de precio y servicios de acuerdo a ellos. Si deseas cambiar código postal o País debes realizar una nueva cotización.",
            icon: 'fa fa-warning',
            type: 'red',
            buttons: {
                back:{
                  text: "Nueva cotización",
                  action: function(scope, button){
                    $state.go('home');
                  }
                },
                close:{
                  text: "Continuar",
                  action: function(scope, button){
                    
                  }
                }
            }
        });
      }

      scope.send = function(){
        if(scope.addressForm.$valid){

            var street= scope.newAddress.street.trim().length;
            var number = scope.newAddress.number.trim().length;
            var apt = 0;
            if(scope.newAddress.apt)
              apt = scope.newAddress.apt.trim().length;

            if(street+number+apt <= 30){



              if(!scope.newAddress.zip){
                scope.newAddress.zip = scope.search;
              }
              var country ={
                code  : scope.newAddress.country.code,
                name  : scope.newAddress.country.name
              }
              scope.newAddress.country = country;
              if(scope.type == 'save'){
                scope.loading();
                userApi.saveAddress(scope.newAddress).then(function(data){
                  // console.log(data)
                  scope.sendForm({response:{result:true, data:data}});
                },function(err){
                  console.log(err);
                  if(err.noSession == true){
                    scope.sendForm({response:{noSession:true}});
                  }else{
                    scope.sendForm({response:err});
                  }
                });
            }else{
              scope.sendForm({response:{result:true,data:scope.newAddress}});
            }
          }else{
            Dialog.showError("El número de caracteres de la calle, número y número interior no debe ser mayor a 30","Dirección excede limite");
          }
        }else{
          Dialog.showMessage();
          // scope.sendForm({response:{error:true,message:scope.labels.form.errors.fields}});
        }
      }
    }
  };
}