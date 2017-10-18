angular
  .module('app.core')
  .directive('cardForm',cardForm);

cardForm.$inject = ['userApi'];

function cardForm(userApi){
  return{
    restrict: 'EA',
    templateUrl: 'app/directives/card/card.form.html',
    scope: {
      labels    : "="
    },
    bindToController: true,
    controllerAs: 'card',
    controller: function($scope){

      var card = this;

      card.labes = $scope.labels;

      card.data = {
        name       : "Carlos Canizal",
        number     : "4242424242424242",
        cvc        : "123",
        expMonth  : 1,
        expYear   : 2018
      }

      card.months = [];
      for(var i=1; i<=12; i++){
        card.months.push(i);
      }

      card.years = [];
      for(var j=2017; j<=2030; j++){
        card.years.push(j);
      }

     
    }
  };
}