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
      ship    : ship,
      createInvoice: createInvoice
    };

    return factory;


    function createInvoice(){
      var Shipping = parse.cloud('createInvoice');
      Shipping.post().then(function(res){
        console.log(res);
      },function(err){
        console.log(err);
      })
    }
        
    function rate(service,params){
      var deferred = $q.defer();
      //flag de debug, quitar en produccion
      params.debugging = true;
      var paquete = paqueteApi.endpoint("/rate");
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
      //flag de debug, quitar en produccion
      params.debugging = true;

      var Shipping = parse.cloud('chargeCard');
      Shipping.post(params).then(function(result){
        console.log(result);
        deferred.resolve(result.result);
      },function(error){
        console.error(error);
        if(error.data && error.data.error){
          deferred.reject(error.data.error);
        }
      });
      return deferred.promise;
      
    }      
      
  }
})();