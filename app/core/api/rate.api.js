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

  function rateApi($q, paqueteApi, userApi, parse, parseheaders, $http) {

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

    function ship(params, userId, taxInfo ){
      
      let user
      if(!userId){
        user = userApi.currentUser()
        if(user && user.objectId)
          userId = user.objectId
        else
          return Promise.reject({noSession:true})
      }
      
      params.debugging = true

      let result
      let Shipping = parse.cloud('chargeCard')

      return Shipping.post(params).then(function(_result){
        result = _result
        
        if(params.shipping.to.country.code.toUpperCase() != 'MX'){

          return $http({
            url: "https://mqxt7kvlib.execute-api.us-west-2.amazonaws.com/dev/intl-inv",
            method: "POST",
            headers:{
              "Content-Type": "application/json"
            },
            data: {
                "shipping": result.result.shipping.service,
                "trackingNumber": result.result.shipping.trackingNumber
            }
          }).then(response => Promise.resolve( params ))

        }else
          return Promise.resolve( params )

      }).then(order => {
        console.log("orderRateAPI", JSON.stringify( order ))
        /*    Makes Invoice     */
        let subtotal = Number(order.shipping.subtotal)
        let invoiceBody = {
          receptor: {
            UsoCFDI: taxInfo.taxUse,
            Rfc: taxInfo.taxId,
            Nombre: taxInfo.taxName,
          },
          info: {
            FormaPago: "99",
            TipoDeComprobante: "I",
            MetodoPago: order.paymentMethod === "account" ? "PPD": "PUE"
          },
          items: [{
              "ClaveProdServ": "78102200",
              "Cantidad": "1",
              "ClaveUnidad": "E48",
              "Unidad": "Servicio",
              "Descripcion": "Servicio de mensajeria: " + result.result.shipping.trackingNumber,
              "ValorUnitario": subtotal + "",
              "Importe": subtotal + "",
          }],
          meta: {
            invoiceType: "shipping",
            userId: userId,
            trackingNumber: result.result.shipping.trackingNumber,
            email: userApi.currentUser().username
          }
        }
        

        return paqueteApi.build( invoiceBody )
        .then( invoiceResult => {
          result.result.invoice = {}
          result.result.invoice.files = {}
          result.result.invoice.files.pdf = invoiceResult.files.pdf
          result.result.invoice.files.xml = invoiceResult.files.xml
          return Promise.resolve(result.result)
        }, err => {
          result.result.invoice = {}
          if( err.message )
            result.result.invoice.error = err.message

          return Promise.resolve(result.result)
        })

      })
    }
  }
})();