(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('paqueteApi', paqueteApi);

  paqueteApi.$inject = ['$q', 'Restangular'];

  /* @ngInject */

  function paqueteApi($q, Restangular) {

    var factory = {
      endpoint  : endpoint
    };

    return factory;

    function endpoint(endpoint){
      ///dev-rate
      Restangular.setBaseUrl('https://r8v9vy7jw5.execute-api.us-west-2.amazonaws.com/rate');
      Restangular.setDefaultHeaders({'Content-Type': 'application/json'});
      return new ParseClass(endpoint);
    }


    function ParseClass(endpoint){ 

      var restObject;
      this.init = function(){
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