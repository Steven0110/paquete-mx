angular
  .module('app.core')
  .directive('addressForm',addressForm);

addressForm.$inject = ['userApi'];

function addressForm(userApi){
  return{
    restrict: 'EA',
    templateUrl: 'app/directives/address/address.form.html',
    scope: true,
    link:function(scope,element,attr){

      var shell =  scope.shell;
      // if(scope.checkout)
        // var checkout = scope.checkout;

      // if(scope.address)
        // var address = scope.address;

      scope.newAddress = {
        country:"MX",
        street:"Hamburgo",
        number: "70",
        apt:"201",
        county:"Juarez",
        city: "Cuauhtemoc",
        state:"Ciudad de México",
        zip:"06600"
      };

      scope.send = function(){
        if(scope.addressForm.$valid){
          
        }else{
          shell.showError(shell.labels.form.errors.fields);
        }
      }

      // scope.hideForm = function(){
      //   if(checkout){
      //     checkout.hideAddressForm();
      //   }
      // }

      // scope.saveAddress = function(){
      //   if(scope.addressForm.$valid){
      //     shell.showLoading();
      //     var objectId;

      //     if(address)
      //       objectId = address.user.objectId;
      //     else
      //       objectId = shell.currentUser.objectId;

      //     scope.newAddress.user = {"__type":"Pointer",className:"_User","objectId":objectId};
      //     userApi.saveAddress(scope.newAddress).then(function(result){
      //       shell.showMessage();
      //       if(address && address.addresses){
      //         address.addresses.push(result);
      //       }
            
      //       if(checkout){
      //         checkout.addresses.push(result);
      //         shell.shoppingCart.shippingAddress = result;
      //       }
      //       scope.newAddress = {};
      //       // scope.addressForm.$setPristine();
      //       scope.addressForm.$setPristine();
      //       scope.addressForm.$setUntouched();
      //       scope.showAddressForm(false);
      //     },function(error){
      //       shell.showError();
      //       console.error('status: '+error.status+', statusText: '+error.statusText+', error: '+error.data.error);
      //     }).finally(shell.hideLoading);
      //   }
      // };
      
    }
  };
}