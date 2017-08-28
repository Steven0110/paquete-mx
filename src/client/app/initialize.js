angular
.module('app')
.run(run);
run.$inject = ['$rootScope','parseheaders','Restangular'];

function run($rootScope,parseheaders, Restangular) {  
  Restangular.setBaseUrl('https://parseapi.back4app.com/');
  Restangular.setDefaultHeaders(parseheaders.restKeys);
}

