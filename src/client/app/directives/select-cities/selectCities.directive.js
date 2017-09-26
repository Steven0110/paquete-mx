angular
  .module('app.core')
  .directive('selectCities',selectCities);

selectCities.$inject = [];

function selectCities(){
  return{
    require: 'ngModel',
    templateUrl: 'app/directives/select-cities/selectDirective.template.html',
    scope: {
      cities : "=cities",
      selected: "=selected",
      search: "=search",
      country: "=country"
    },
    replace: true,
    transclude: true,
    restrict: 'E',
    bindToController: true,
    controllerAs: 'vm',
    controller:function($scope){ 
      var vm = this;
      var search;
      vm.options = [];

      $scope.$watch('vm.search', function(oldValue, newValue){
        if(vm.search){
          if(vm.country && vm.country.listed){
            if(!vm.search.includes("-")){
              delaySearch(vm.search);
            }
          }
        }else{
          vm.options = [];  
        }
      });

      vm.selectItem = function(item){
        vm.selected = item;
        vm.search = item.CP+" - "+item.asentamiento;
        vm.options = [];
      }

      var delayTimer;
      function delaySearch(term) {
        if(term && term.length > 2){
          var options = JSON.search(vm.cities, '//*[contains(asentamiento, "'+term+'") or contains(CP, "'+term+'")]');
          vm.options = options;
        }else{
          vm.options = [];
        }
      }
    }
  };
}