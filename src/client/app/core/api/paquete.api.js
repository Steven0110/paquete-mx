(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('paqueteApi', paqueteApi);

  paqueteApi.$inject = ['$q', 'Restangular','parseheaders', '$http'];

  /* @ngInject */

  function paqueteApi($q, Restangular, parseheaders, $http) {

    var factory = {
      endpoint  : endpoint,
      build : build,
    };

    return factory;

    function endpoint(endpoint){
      ///dev-rate
      return new ParseClass(endpoint);
    }


    function ParseClass(endpoint){ 

      var restObject;
      this.init = function(){
        var baseUrl = parseheaders.apiEndpoint['baseUrl'];
        Restangular.setBaseUrl(baseUrl);
        Restangular.setDefaultHeaders({'Content-Type': 'application/json'});
        restObject = Restangular.service(endpoint);
      }

      this.init();

      return {
        
        get: function(params){
          return getObject(params);
        },
        post: function(params){
          return restObject.post(params);
        },
        put: function(params){
          return restObject.one().customPUT(params);
        }        
      }
    }

    function build( body ) {

      let url = parseheaders.apiEndpoint.invoice + "create-invoice"
      let config = {
        headers: {
          "x-api-key": parseheaders.apiKeys.invoiceApiKey,
          'Content-Type': 'application/json'
        }
      }
      return new Promise((resolve, reject) => {
        $http.post( url, body, config)
        .success(function (data, status, headers, config) {
          console.log( status )
          console.log( data )
          resolve( data )
        })
        .error(function (data, status, headers, config) {
          console.log( status )
          console.log( data )
          reject( data )
        })
      })

    }

  }
})();