angular
  .module('app.core')
  .directive('selectCities',selectCities);

selectCities.$inject = ['$http','$document','parseheaders'];

function selectCities($http, $document, parseheaders){
  return{
    require: 'ngModel',
    templateUrl: 'app/directives/select-cities/selectDirective.template.html',
    scope: {
      cities    : "=cities",
      selected  : "=selected",
      search    : "=search",
      country   : "=country"
    },
    replace: true,
    transclude: true,
    restrict: 'E',
    bindToController: true,
    controllerAs: 'vm',
    controller:function($scope){ 
      var vm = this;
      vm.loading;
      var country;

      vm.options = [];

      $document.on('click', function(element){
        if(vm.options.length > 0){
          if(element.target && element.target.className){
            var item = element.target.className;
            if(item != 'absolute-item'){
              vm.options =[];
              vm.loading = false;
              $scope.$apply();
            }
          }
        }
      });


      $scope.$watch('vm.search', function(oldValue, newValue){
        // console.log(newValue);
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
        // console.log('item',item);
        vm.selected = item;
        vm.search = item.zip+" - "+item.county;
        vm.options = [];
      }


      var delayTimer;
      function delaySearch(search, country) {
        if(search && search.length > 2){
          vm.clean =false;
          vm.loading = true;
          vm.options = [];
          search = search.trim();
          search = encodeURI(search);
          var baseUrl = parseheaders.apiEndpoint['baseUrl'];
          $http.post(baseUrl+"/counties",{search:search,country:country})
          .then(function(response) {
            if(response && response.data && response.data.length > 0)
              vm.options = response.data;
            else
              vm.options = [];
          }, function(err) {
            vm.options = [];
          }).finally(function(){
            vm.loading = false;
          });
        }else{
          vm.options = [];
        }
      }
    }
  };
}