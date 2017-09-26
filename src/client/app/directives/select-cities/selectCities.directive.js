angular
  .module('app.core')
  .directive('selectCities',selectCities);

selectCities.$inject = [];

function selectCities(){
  return{
    // require: 'ngModel',
    templateUrl: 'app/directives/select-cities/selectDirective.template.html',
    scope: {
      cities : "=",
      selected: "=",
      search: "="
    },
    restrict: 'E',
    link:function(scope,element,attrs,ctrl){ 

      scope.options = [];

      scope.$watch('cities', function(){
        scope.cities = scope.cities;
      })

      scope.$watch('search', function(){
        validateInput(scope.search);
      })

      scope.selectItem = function(item){
        scope.selected = item;
      }

      validateInput = function(search){
        delaySearch(search);
      }

      var delayTimer;
      function delaySearch(term) {
        if(term && term.length > 2){
          var options = JSON.search(scope.cities, '//*[contains(asentamiento, "'+term+'") or contains(CP, "'+term+'")]');
          scope.options = options;
        }else{
          scope.options = [];
        }
      }
    }
  };
}