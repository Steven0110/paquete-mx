(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Dashboard',Dashboard);

  Dashboard.$inject = ['$state','$scope','$q','$timeout','template','Dialog','$window'];

  function Dashboard($state, $scope, $q, $timeout, template, Dialog, $window){
  	var dashboard = this
  	dashboard.popup = {};

  	dashboard.popup = {
      "status": true,
      "info": {
        "title": "Aviso",
        "paragraphs": [
          "Informamos a todos nuestros clientes que debido a una actualización de nuestros sistemas y mejoras de seguridad en nuestros procesos será necesario volver a agregar las tarjetas de crédito o débito que hayan sido registradas en la plataforma, esto con el fin de brindarles un mejor servicio.",
          "Gracias.",
          //""
        ],
        "footerImage": "common/images/paquete-mx.png"
      }
    };

    dashboard.closePopup = function(){
      dashboard.popup.status = false;
    }
  };
 })();