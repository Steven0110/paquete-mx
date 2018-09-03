angular
  .module('app.core')
  .directive('cardForm',cardForm);

cardForm.$inject = ['paymentGateway','Dialog'];

function cardForm(paymentGateway, Dialog){
  return{
    restrict: 'EA',
    templateUrl: 'app/directives/card/card.form.html',
    scope: {
      labels        : "=",
      sendForm      : "&",
      cancelForm    : "&",
      showLoading   : "&",
      hideLoading   : "&"
    },
    bindToController: true,
    controllerAs: 'card',
    controller: function($scope){
      var card = this;

      card.info = {
        name       : null,
        card_number: null,
        cvc        : null,
        exp_month  : 1,
        exp_year : 2019,
        address_line_1: null,
        address_line_2: null,
        city: null,
        state: null,
        country: "México",
        postal_code: null
      }

      card.months = [];
      for(var i=1; i<=12; i++){
        card.months.push(i);
      }

      card.years = [];
      for(var j=2018; j<=2030; j++){
        card.years.push(j);
      }

      card.cancel = function(){
        card.cancelForm();
      }

      card.send = function(){
        if(card.form.$valid){
          card.showLoading();
          paymentGateway.update(card.info).then(function(res){
            card.sendForm({response:res});
          },function(err){
            console.log(err);
            var message = JSON.stringify(err);
            Dialog.showError(message,"Hubo un error al agregar tu tarjeta.");
            /*var message = Object.keys(err)[0];
            if(err[message]){
              if(err[message][0]){
                message = err[message][0];
              }else{
                message = err[message];
              }
            }else{
              message = err;
            }*/
          }).finally(card.hideLoading);
        }else{
          Dialog.showMessage();
        }
      }
    }
  };
}