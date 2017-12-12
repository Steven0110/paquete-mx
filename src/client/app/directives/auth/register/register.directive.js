angular
  .module('app.core')
  .directive('registerForm',registerForm);

registerForm.$inject = ['userApi','Dialog'];

function registerForm(userApi, Dialog){
  return{
    restrict: 'E',
    templateUrl: 'app/directives/auth/register/register.form.html',
    scope: true,
    link:function(scope,element,attr){
      var shell = scope.shell;

      scope.passwordMatch = null;
      scope.user = {
        name: null,
        lastname: null,
        phone: null,
        username: null,
        password: null
      }
      
      scope.register = function(){
        if(scope.registerForm.$valid){
          shell.showLoading();
          userApi.register(scope.user).then(function(user){
            scope.setUser(user);
            shell.showMessage(shell.labels.register.form.welcome);
            scope.loginSuccess();
          },function(error){
            console.log(error);
            if(error.data.error){
              // scope.response.register = error.data.error;
              if(error.data.code == 202){
                var error = scope.user.username+" "+shell.labels.register.form.errors.already;
                Dialog.showError('No se pudo registrar el usuario',error);  
              }
            }else{
              Dialog.showError('No se pudo registrar el usuario',error);  
            }
          }).finally(shell.hideLoading);
        }else{
          Dialog.showMessage();
          // shell.showError('Verifica los campos requeridos.');
        }
      };
    }
  };
}