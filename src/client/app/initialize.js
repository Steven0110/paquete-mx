angular
.module('app')
.run(run);
run.$inject = ['$rootScope','Restangular'];

function run($rootScope, Restangular) {  
  Restangular.setBaseUrl('https://parseapi.back4app.com/');
}

