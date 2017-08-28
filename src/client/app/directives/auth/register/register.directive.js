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

      scope.passwordMatch = "canizal";
      scope.user = {
        name: "Carlos",
        lastname: "Canizal",
        phone: "5535068102",
        username: "carlos@canizal.com",
        password: "canizal"
      }
      
      scope.register = function(){
        if(scope.registerForm.$valid){
          shell.showLoading();
          userApi.register(scope.user).then(function(user){
            scope.setUser(user);
            shell.showMessage(shell.labels.register.form.welcome);
          },function(error){
            console.log(error);
            if(error.data.error){
              // scope.response.register = error.data.error;
              if(error.data.code == 202){
                var error = scope.user.username+" "+shell.labels.register.form.errors.already;
                shell.showError(error)
              }
            }else{
              shell.showError(error);
            }
          }).finally(shell.hideLoading);
        }else{
          shell.showError('Verifica los campos requeridos.');
        }
      };
    }
  };
}