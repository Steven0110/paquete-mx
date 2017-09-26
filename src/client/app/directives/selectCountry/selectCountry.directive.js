angular
  .module('app.core')
  .directive('selectCountry',selectCountry);

selectCountry.$inject = [];

function selectCountry(){
  return{
    require: 'ngModel',
    templateUrl: 'app/directives/selectCountry/selectCountry.template.html',
    scope: {
      countries : "=",
      country   : "="
    },
    replace: true,
    transclude: true,
    restrict: 'E',
    bindToController: true,
    controllerAs: 'vm',
    controller:function($scope){ 
      var vm = this;
      vm.list = [];
      vm.show = false;
      $scope.$watch('vm.countries',function(){
        if(vm.countries && vm.countries[0]){
          vm.country = vm.countries[0];
        }
        vm.list = vm.countries;
      });

      vm.showCountries = function(){
        vm.show = true;
      };

      vm.selectItem = function(item){
        vm.country =  item;
        vm.show = false;
      }

      
    }
  };
}