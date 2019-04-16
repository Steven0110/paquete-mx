(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('rateApi', rateApi);

  rateApi.$inject = ['$q', 'paqueteApi','userApi','parse','parseheaders', '$http'];

  /* @ngInject */

  function isEmpty(obj) {
      for(var key in obj) {
          if(obj.hasOwnProperty(key))
              return false;
      }
      return true;
  };

  function rateApi($q, paqueteApi,userApi, parse, parseheaders, $http) {

    var factory = {
      rate    : rate,
      ship    : ship,
      createInvoice: createInvoice,
      sendNotification: sendNotification
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


    function sendNotification(button){
      var Notification = parse.cloud('sendNotification');
      return Notification.post({button:button});
    }
    
    function rate(service,params){
      var deferred = $q.defer();
      var paquete = paqueteApi.endpoint("/rate");
      console.log(params)
      
      /*    Dimensions to string    */
      if(params.type == "ups")
        for( let i = 0 ; i < params.rate.packages.length ; i++ ){
          params.rate.packages[ i ].height = params.rate.packages[ i ].height.toString()
          params.rate.packages[ i ].length = params.rate.packages[ i ].length.toString()
          params.rate.packages[ i ].width = params.rate.packages[ i ].width.toString()
        }

      paquete.post(params).then(function(data){
        
        if(parseheaders.debugging){
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
        
        if(params.shipping.to.country.code.toUpperCase() != 'MX'){

          $http({
            url: "https://mqxt7kvlib.execute-api.us-west-2.amazonaws.com/dev/intl-inv",
            method: "POST",
            headers:{
              "Content-Type": "application/json"
            },
            data: {
                "shipping": result.result.shipping.service,
                "trackingNumber": result.result.shipping.trackingNumber
            }
          }).then(function(response){
            deferred.resolve(result.result);
          })

        }else{
          deferred.resolve(result.result)
        }

      },function(error){
        //alert(JSON.stringify(error.data.error));
        console.error(error)
        if(error.data){
          if(isEmpty(error.data.error)){
            /*    Payment might be done but with no shipping    */
            deferred.reject({"code": -12345})
          }else{
            deferred.reject(error.data.error)
          }
        }
      });
      return deferred.promise;
      
    }
  }
})();