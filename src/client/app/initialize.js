angular
.module('app')
.run(run);
run.$inject = ['$rootScope','Restangular'];

function run($rootScope, Restangular) {  
  // Restangular.setBaseUrl('https://r8v9vy7jw5.execute-api.us-west-2.amazonaws.com/rate');
}

