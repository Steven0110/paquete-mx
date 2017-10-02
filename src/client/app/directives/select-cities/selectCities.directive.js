angular
  .module('app.core')
  .directive('selectCities',selectCities);

selectCities.$inject = ['$http'];

function selectCities($http){
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
      var country;

      vm.options = [];

      $scope.$watch('vm.search', function(oldValue, newValue){
        console.log(vm.search);
        if(vm.search){
          if(vm.country && vm.country.listed){
            if(!vm.search.includes("-")){
              delaySearch(vm.search, vm.country.code);
            }
          }
        }else{
          vm.options = [];  
        }
      });

      vm.selectItem = function(item){
        vm.selected = item;
        vm.search = item.zip+" - "+item.county;
        vm.options = [];
      }

      var delayTimer;
      function delaySearch(search, country) {
        console.log(search);
        console.log(country);
        if(search && search.length > 2){
          // var options = JSON.search(vm.cities, '//*[contains(county, "'+term+'") or contains(zip, "'+term+'")]');
          console.log(search);
          $http({
            method: 'POST',
            url: 'https://r8v9vy7jw5.execute-api.us-west-2.amazonaws.com/rate/counties',
            data:{
              search: search,
              country: country
            }
          }).then(function(response) {
            console.log(response);
            if(response && response.data && response.data.length > 0)
              vm.options = response.data;
            else
              vm.options = [];
              
          }, function(err) {
            vm.options = [];
            console.log(err);
          });
        }else{
          vm.options = [];
        }
      }
    }
  };
}