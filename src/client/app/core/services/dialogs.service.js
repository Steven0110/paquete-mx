(function() {
  'use strict';

  angular
  .module('app.core')
  .service('Dialog', Dialog);

  Dialog.$inject = ['$ngConfirm'];

  function Dialog($ngConfirm) {

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
