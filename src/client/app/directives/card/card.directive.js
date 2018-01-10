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
        name       : "Carlos Canizal",
        card_number: "4242424242424242",
        cvc        : "123",
        exp_month  : 1,
        exp_year : 2019,
        address_line_1: "Hamburgo 70",
        address_line_2: "Col. Juarez",
        city: "Cuauhtemoc",
        state: "CDMX",
        country: "México",
        postal_code: "06600"
      }

      card.months = [];
      for(var i=1; i<=12; i++){
        card.months.push(i);
      }

      card.years = [];
      for(var j=2017; j<=2030; j++){
        card.years.push(j);
      }

      card.cancel = function(){
        card.cancelForm();
      }

      card.send = function(){
        if(card.form.$valid){
          card.showLoading();
          paymentGateway.update(card.info).then(function(res){
            console.log(res);
            card.sendForm({response:res});
          },function(err){
            console.log(err);
            var message = Object.keys(err)[0];
            if(err[message]){
              if(err[message][0]){
                message = err[message][0];
              }else{
                message = err[message];
              }
            }else{
              message = err;
            }
            Dialog.showError(message,"Hubo un error al agregar tu tarjeta.");
          }).finally(card.hideLoading);
        }else{
          Dialog.showMessage();
        }
      }
    }
  };
}