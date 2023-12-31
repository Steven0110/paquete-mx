angular
  .module('app.core')
  .directive('loginForm',loginForm);

loginForm.$inject = ['userApi','Dialog'];

function loginForm(userApi, Dialog){
  return{
    restrict: 'E',
    templateUrl: 'app/directives/auth/login/login.form.html',
    scope: true,
    link:function(scope,element,attr){
      var shell = scope.shell;

      scope.user = {
        username: null,
        password: null
      }
      
      scope.login = function(){
        if(scope.loginForm.$valid){
          shell.showLoading();
          userApi.login(scope.user).then(function(user){
            scope.setUser(user);
            shell.showMessage(shell.labels.login.form.welcome);            
            if (typeof scope.loginSuccess === "function") { 
              scope.loginSuccess();
            }else{
              shell.loginSuccess();
            }
          },function(error){
            console.log(error);
            Dialog.showError("Verifica tu correo electrónico y contraseña",shell.labels.login.form.unauth);  
            // shell.showError(shell.labels.login.form.unauth);
          }).finally(shell.hideLoading);
        }else{
          shell.showError(shell.labels.form.errors.fields);
        }
      };
    }
  };
}