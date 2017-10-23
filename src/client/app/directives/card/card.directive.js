angular
  .module('app.core')
  .directive('cardForm',cardForm);

cardForm.$inject = ['conektaApi','Dialog'];

function cardForm(conektaApi, Dialog){
  return{
    restrict: 'EA',
    templateUrl: 'app/directives/card/card.form.html',
    scope: {
      labels        : "=",
      sendForm      : "&",
      showLoading   : "&",
      hideLoading   : "&"
    },
    bindToController: true,
    controllerAs: 'card',
    controller: function($scope){
      var card = this;

      card.info = {
        name       : "Carlos Canizal",
        number     : "4242424242424242",
        cvc        : "123",
        exp_month  : 1,
        exp_year : 2018
      }

      card.months = [];
      for(var i=1; i<=12; i++){
        card.months.push(i);
      }

      card.years = [];
      for(var j=2017; j<=2030; j++){
        card.years.push(j);
      }

      card.send = function(){
        if(card.form.$valid){
          var conektaId =  false;
          card.showLoading();
          conektaApi.update(card.info).then(function(newCard){
            var response = newCard.text ? JSON.parse(newCard.text) : newCard;
            card.sendForm({response:response});
          },function(error){
            console.log(error);
            if(error && error.message_to_purchaser){
              error = error.message_to_purchaser;
            }else{
              error = 'Hubo un error por favor recarga tu navegador e intenta de nuevo.';
            }
            Dialog.showError(error);
          }).finally(card.hideLoading);
        }else{
          Dialog.showMessage();
        }
      }

     
    }
  };
}