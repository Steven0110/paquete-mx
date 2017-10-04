(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('rateApi', rateApi);

  rateApi.$inject = ['$q', 'paqueteApi','userApi','parse'];

  /* @ngInject */

  function rateApi($q, paqueteApi,userApi, parse) {

    var factory = {
      rate    : rate,
      ship    : ship
    };

    return factory;
        
    function rate(service,params){
      var deferred = $q.defer();
      //flag de debug, quitar en produccion
      params.debugging = true;
      var paquete = paqueteApi.endpoint("/dev-rate");
      paquete.post(params).then(function(data){

        if(params.debugging){
          console.log(data);
        }
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

    function ship(params, userId){
      var deferred = $q.defer();
      //flag de debug, quitar en produccion

      if(!userId){
        var user = userApi.currentUser();
        if(user && user.objectId){
          userId = user.objectId;
        }else{
          var deferred = $q.defer();
          deferred.reject({noSession:true});
          return deferred.promise;
        }
      }
      params.debugging = true;

      //automatizar
      params.type = "ups";

      var Shipping = parse.cloud('Shipping');
      Shipping.post({shipping:params,userId:userId}).then(function(result){
        deferred.resolve(result.result);
      },function(error){
        console.log(error);
        deferred.reject(error);
      });
      return deferred.promise;
      
    }      
      
    

  }
})();