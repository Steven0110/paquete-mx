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
    link:function(scope,element,attr){

     
    }
  };
}