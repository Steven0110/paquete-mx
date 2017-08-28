angular
  .module('app.core')
  .directive('loginForm',loginForm);

// loginForm.$inject = ['userApi','storage'];
loginForm.$inject = [];

function loginForm(){
  return{
    restrict: 'E',
    templateUrl: 'app/directives/auth/login/login.form.html',
    scope: true,
    link:function(scope,element,attr){
      var shell = scope.shell;
      scope.response = {code:400};
      
      scope.login = function(){
        scope.response.login = false;
        if(scope.loginForm.$valid){
          shell.showLoading();
          userApi.login(scope.user).then(function(user){
            scope.setUser(user);
            shell.setMessage('¡Bienvenido!');
          },function(error){            
            scope.response.login = error.data.error;
            scope.response.code = error.data.code;
            shell.setError(error);
            shell.showError('Verifica que los datos sean correctos.');
          }).finally(shell.hideLoading);
        }else{
          shell.showError('Verifica los campos requeridos.');
        }
      };
    }
  };
}