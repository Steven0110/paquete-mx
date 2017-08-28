angular
  .module('app.core')
  .directive('registerForm',registerForm);

registerForm.$inject = ['userApi'];

function registerForm(userApi){
  return{
    restrict: 'E',
    templateUrl: 'app/directives/auth/register/register.form.html',
    scope: true,
    link:function(scope,element,attr){
      var shell = scope.shell;

      scope.user = {
        username: "carlos@canizal.com",
        password: "canizal"
      }
      
      scope.login = function(){
        if(scope.registerForm.$valid){
          shell.showLoading();
          userApi.login(scope.user).then(function(user){
            scope.setUser(user);
            shell.showMessage(shell.labels.login.form.welcome);
          },function(error){
            console.log(error);
            shell.showError(shell.labels.login.form.unauth);
          }).finally(shell.hideLoading);
        }else{
          shell.showError(shell.labels.form.errors.fields);
        }
      };
    }
  };
}