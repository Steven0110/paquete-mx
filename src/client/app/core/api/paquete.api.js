(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('paqueteApi', paqueteApi);

  paqueteApi.$inject = ['$q', 'Restangular','parseheaders'];

  /* @ngInject */

  function paqueteApi($q, Restangular, parseheaders) {

    var factory = {
      endpoint  : endpoint
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

  }
})();