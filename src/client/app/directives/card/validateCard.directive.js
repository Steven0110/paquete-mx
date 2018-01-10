angular
  .module('app.core')
  .directive('validateCard',validateCard);

validateCard.$inject = [];

function validateCard(){
  return{
    restrict: 'A',
    require: 'ngModel',
    link:function(scope,element,attr,ngModel){
      ngModel.$validators.validateCard = function(modelValue) {
        return Conekta.card.validateNumber(modelValue);
      };
    }
  };
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
      ngModel.$validators.validateCvc = function(modelValue) {
        var brand =Conekta.card.getBrand(scope.card.info.card_number);
        if(brand == 'amex'){
          var validation = Conekta.card.validateCVC(modelValue);
          if(validation){
            if(modelValue.length == 4){
              return true;
            }else{
              return false;
            }
          }else{
            return validation;
          }
        }else{
          var validation = Conekta.card.validateCVC(modelValue);
          if(validation){
            if(modelValue.length == 3){
              return true;
            }else{
              return false;
            }
          }else{
            return validation;
          }
        }
      };
    }
  };
}
