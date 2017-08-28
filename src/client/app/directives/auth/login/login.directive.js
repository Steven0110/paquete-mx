angular
  .module('app.core')
  .directive('loginForm',loginForm);

loginForm.$inject = ['userApi'];

function loginForm(userApi){
  return{
    restrict: 'E',
    templateUrl: 'app/directives/auth/login/login.form.html',
    scope: true,
    link:function(scope,element,attr){
      var shell = scope.shell;

      scope.user = {
        username: "carlos@canizal.com",
        password: "canizal"
      }
      
      scope.login = function(){
        if(scope.loginForm.$valid){
          shell.showLoading();
          userApi.login(scope.user).then(function(user){
            scope.setUser(user);
            shell.setMessage('¡Bienvenido!');
          },function(error){            
            shell.showError('Verifica que los datos sean correctos.');
          }).finally(shell.hideLoading);
        }else{
          shell.showError('Verifica los campos requeridos.');
        }
      };
    }
  };
}