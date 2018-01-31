(function() {
  'use strict';

  angular
  .module('app.core')
  .service('Dialog', Dialog);

  Dialog.$inject = ['$ngConfirm'];

  function Dialog($ngConfirm) {

    this.confirmDialog = function(title,content,buttons,actions, cancel){
      $ngConfirm({
            title: title.main,
            content: content.main,
            theme: 'supervan',
            buttons: {
                continue: {
                    text: buttons.main.continue,
                    btnClass: 'btn-blue',
                    action: function(scope, button){
                      // invoice.info.amount = parseFloat(invoice.info.amount);
                      if(content.secondary){
                        $ngConfirm({
                          content: content.secondary,
                          title: title.secondary,
                          buttons: {
                            continue: {
                              text: buttons.secondary.continue,
                              btnClass: 'btn-blue',
                              action: function(scope,button){
                                actions();
                              }
                            },
                            close:{
                              text: buttons.secondary.cancel,
                              action: function(scope, button){
                                // closes the modal
                                cancel();
                              }
                            }
                          }
                        });
                      }else{
                        actions();
                      }
                    }
                },
                close:{
                  text: buttons.main.cancel,
                  action: function(scope, button){
                    cancel();
                  }
                }
            }
        });
    }


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

    this.successDialog =  function(title,content,buttons,actions){
      $ngConfirm({
          title: title.main,
          content: content.main,
          escapeKey: true,
          theme: 'supervan',
          buttons: {
              close:{
                text: buttons.main.cancel,
                action: function(scope, button){
                  actions();
                }
              }
          }
      });
    }



    this.showError = function(message, title, action){
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
                  if (typeof action === "function") { 
                    action();
                  }
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
