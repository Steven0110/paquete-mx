(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('rateApi', rateApi);

  rateApi.$inject = ['$q', 'paqueteApi'];

  /* @ngInject */

  function rateApi($q, paqueteApi) {

    var factory = {
      rate  : rate
    };

    return factory;
        
    function rate(service,params){
      var deferred = $q.defer();
      var paquete = paqueteApi.endpoint("/dev-rate");
      paquete.post(params).then(function(data){
        var json ={
          service: service
        };
        if(data.services)
          json.services = data.services;
        if(data.totalServices)
          json.totalServices = data.totalServices;
        deferred.resolve(json);
      },function(err){
        deferred.reject(err);
      })
      return deferred.promise;
    }       
      
    

  }
})();