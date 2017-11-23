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
        username: "carlos@canizal.com",
        password: "canizal"
      }
      
      scope.login = function(){
        if(scope.loginForm.$valid){
          shell.showLoading();
          userApi.login(scope.user).then(function(user){
            scope.setUser(user);
            shell.showMessage(shell.labels.login.form.welcome);            
            scope.loginSuccess();
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