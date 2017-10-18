angular
  .module('app.core')
  .directive('cardForm',cardForm);

cardForm.$inject = ['userApi'];

function cardForm(userApi){
  return{
    restrict: 'EA',
    templateUrl: 'app/directives/card/card.form.html',
    scope: {
      labels    : "=",
      sendForm  : "&"
    },
    bindToController: true,
    controllerAs: 'card',
    controller: function($scope){
      var card = this;

      // if(!card.info){
        card.info = {
          name       : "Carlos Canizal",
          number     : "4242424242424242",
          cvc        : "123",
          expMonth  : 1,
          expYear   : 2018
        }
      // }

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
          // var data = card.info;

          conektaApi.update(card.info).then(function(newcard){
            // shell.setSuccess("La tarjeta se agrego con éxito.");
            // $state.go($state.current, {}, {reload: true});
            console.log(newcard);
          },function(error){
            console.log(error);
            if(error && error.message_to_purchaser){
              error = error.message_to_purchaser;
            }else{
              error = 'Hubo un error por favor recarga tu navegador e intenta de nuevo.';
            }
            console.log(error);
            // shell.setError(error);
          });
          // .finally(shell.stopLoading);

          // card.sendForm({response:{result:true, data:data}});
        }else{
          alert('invalid form');
        }
      }

     
    }
  };
}