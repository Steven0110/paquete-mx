angular
  .module('app.core')
  .directive('selectCountry',selectCountry);

selectCountry.$inject = ['$document'];

function selectCountry($document){
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
        if(vm.countries && vm.countries[0] && !vm.country){
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

      $document.on('click', function(element){
        if(vm.list.length > 0){
          if(element.target && element.target.className){
            var item = element.target.className;
            // console.log(item);
            if(!item.includes('country-name') && !item.includes('country-search') && !item.includes('fa-angle-down')){
              vm.search ="";
              vm.show = false;
              $scope.$apply();
            }
          }
        }
      });

      
    }
  };
}