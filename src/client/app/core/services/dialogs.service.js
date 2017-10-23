(function() {
  'use strict';

  angular
  .module('app.core')
  .service('Dialog', Dialog);

  Dialog.$inject = ['$ngConfirm'];

  function Dialog($ngConfirm) {

    this.showError = function(message, title){
      var title = title?title:'¡Ops, Hubo un error!';

      $ngConfirm({
          theme: 'supervan',
        title: title,
          content: message,
          icon: 'fa fa-warning',
          type: 'red',
          buttons: {
              close:{
                text: "Cerrar",
                action: function(scope, button){
                  
                }
              }
          }
      });
    }

    this.showMessage = function(){
      $ngConfirm({
          theme: 'supervan',
        title: '¡Verifica los campos requeridos!',
          content: 'Toda la información con <strong>*</strong> (asterisco) es requerida para continuar.',
          buttons: {
              close:{
                text: "Cerrar",
                action: function(scope, button){
                  
                }
              }
          }
      });
    }


  }
})();
