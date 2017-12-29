(function() {
  'use strict';

  angular
  .module('app.core')
  .service('Dialog', Dialog);

  Dialog.$inject = ['$ngConfirm'];

  function Dialog($ngConfirm) {


    this.showTooltip = function(title, content, buttons){

      var title = title?title:'¡Atención!';

      var buttonActions = {};

      if(buttons.continue){
        buttonActions.continue = {
          text: buttons.continue,
          action: function(scope, button){
          }
        }
      }

      if(buttons.close){
        buttonActions.close = {
          text: buttons.close,
          action: function(scope, button){
          }
        }
      }



      $ngConfirm({
          theme: 'supervan',
          title: title,
          content: content,
          icon: 'fa fa-info-circle',
          buttons: buttonActions
      });
    }



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
