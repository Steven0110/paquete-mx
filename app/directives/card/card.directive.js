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
        birthDate  : null,
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
          card.showLoading()
          
          paymentGateway.tokenize( card.info )
          .then( tokenizedCard => paymentGateway.update(tokenizedCard) )
          .then( response => {
            Dialog.successDialog({main:'¡Listo!'}, {main: "Tarjeta agregada correctamente"}, {main:{cancel:"Cerrar"}},
              () => card.sendForm({response:response})
            )
          })
          .catch( error => {
            console.error( error )
            let message
            if( error.data && error.data.error && error.data.error.details && error.data.error.details[0].message)
              message = error.data.error.details[0].message
            else if( error.message_to_purchaser )
              message = error.message_to_purchaser
            else
              message = "Error desconocido"
            Dialog.showError( message, "Error al agregar la tarjeta" )
          })
          .finally(card.hideLoading)
        }
      }
    }
  };
}