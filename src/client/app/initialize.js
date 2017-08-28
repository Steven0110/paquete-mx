angular
.module('app')
.run(run);
run.$inject = ['$rootScope','$transitions','$state','parseheaders','userApi','Restangular'];

function run($rootScope, $transitions,$state, parseheaders, userApi, Restangular) {  
  Restangular.setBaseUrl('https://parseapi.back4app.com/');
  Restangular.setDefaultHeaders(parseheaders.restKeys);

  
  $transitions.onSuccess({}, function($transitions){
    var newToState = $transitions.$to();
    if(newToState.parent && newToState.parent.data && newToState.parent.data.access){
      if(!userApi.isAuth()){
        event.preventDefault();
        $state.go('login');
      }
    }
  });



}

