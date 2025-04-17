angular
  .module('app.core')
  .directive('registerForm',registerForm);

registerForm.$inject = ['$window','userApi','Dialog', 'accountApi','rateApi','$q'];

function registerForm($window,userApi, Dialog, accountApi,rateApi,$q){
  return{
    restrict: 'E',
    templateUrl: 'app/directives/auth/register/register.form.html',
    scope: true,
    link:function(scope,element,attr){
      var shell = scope.shell;

      scope.passwordMatch = null;
      scope.accountType = 'personal';
      scope.account = {};
      scope.user = {
        name: null,
        lastname: null,
        phone: null,
        username: null,
        password: null
      }

      scope.taxUses = [{code:'G01',name:'Adquisición de mercancias'},{code:'G02',name:'Gastos en general'},{code:'P01',name:'Por definir'}];
      scope.account.taxUse = scope.taxUses[1].code;

      scope.$watch('accountType',function(newValue, oldValue){
        if(newValue == 'enterprise'){
          scope.account.invoice =  true;
        }else if(newValue == 'personal'){
          scope.account.invoice =  false;
        }
      });


      function validateTaxId(taxId){
        var deferred = $q.defer();
        if(taxId){
          accountApi.validateTaxId(taxId).then(function(res){
            if(res && res.valid){
              deferred.resolve();
            }else{
              deferred.reject({invalidTaxId:true});
            }
          },function(err){
            deferred.reject(err);
          });
        }else{
          deferred.resolve();
        }
        return deferred.promise;
      }
      
      scope.register = function(){
        if(scope.registerForm.$valid){

          var title ={main:"Términos y Condiciones",secondary:"He verificado mi información."};
          var content ={main:"He Leído, entiendo y ACEPTO los <a class='underline' ui-sref='privacy' target='_blank'>Términos y Condiciones</a>. Así como las <a class='underline' ui-sref='privacy' target='blank'>Políticas de Privacidad</a>."};
          var buttons ={main:{continue:"ACEPTO",cancel:"NO Acepto"},secondary:{continue:"Crear Etiqueta",cancel:"No, cancelar"}};
          Dialog.confirmDialog(title,content,buttons, function(){
            shell.showLoading();

            scope.user.accountType = scope.accountType;
            if(scope.accountType == 'personal' && !scope.account.invoice){
              scope.account.taxId = null;
              scope.account.invoice = false;
              scope.account.taxName = null;
            }

            userApi.register(scope.accountType,scope.account,scope.user)
            .then(function(user){
              scope.setUser(user);
              shell.showMessage(shell.labels.register.form.welcome);
              $window.gtag('event', 'search', {
                'event_category' : 'registro',
                'event_label' : 'registro_event'
              });
              rateApi.sendNotification('Registrar');
              if (typeof scope.loginSuccess === "function") { 
                scope.loginSuccess();
              }else{
                shell.loginSuccess();
              }

              
            },function(error){
              console.log(error);
              if(error && error.invalidTaxId){
                Dialog.showError("La verificación con el SAT nos marco el RFC como inválido, verifica que este correcto y que este activo ante el SAT", "¡RFC INVALIDO!");
              }
              else if(error && error.data && error.data.error){
                // scope.response.register = error.data.error;
                if(error.data.code == 202){
                  var error = scope.user.username+" "+shell.labels.register.form.errors.already;
                  Dialog.showError('No se pudo registrar el usuario',error);  
                }
              }else{
                Dialog.showError('No se pudo registrar el usuario',error);  
              }
            }).finally(shell.hideLoading);
          },function(){})
        }else{
          Dialog.showMessage();
          // shell.showError('Verifica los campos requeridos.');
        }
      };
    }
  };
}