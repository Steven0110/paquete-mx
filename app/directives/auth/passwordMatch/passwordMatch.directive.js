angular
  .module('app.core')
  .directive('passwordMatch',passwordMatch);

passwordMatch.$inject = ['userApi','storage'];

function passwordMatch(userApi, storage){
  return{
    require: 'ngModel',
    scope: true,
    restrict: 'A',
    link:function(scope,element,attrs,ctrl){      
      var checker = function(){
        var value = scope.$eval(attrs.ngModel);
        var value2 = scope.$eval(attrs.passwordMatch);
        return value == value2;
      };

      scope.$watch(checker, function(response){
        ctrl.$setValidity("match",response);
      });
      
    }
  };
}