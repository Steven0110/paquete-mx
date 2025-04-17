angular
  .module('app.core')
  .directive('validateCard',validateCard);

validateCard.$inject = [];

function validateCard(){
  return{
    restrict: 'A',
    require: 'ngModel',
    link:function(scope,element,attr,ngModel){
      ngModel.$validators.validateCard = modelValue => Conekta.card.validateNumber(modelValue)
    }
  }
}

angular
  .module('app.core')
  .directive('validateCvc',validateCvc);

validateCvc.$inject = [];

function validateCvc(){
  return{
    restrict: 'A',
    require: 'ngModel',
    link:function(scope,element,attr,ngModel){
      ngModel.$validators.validateCvc = modelValue => Conekta.card.validateCVC(modelValue)
    }
  };
}
