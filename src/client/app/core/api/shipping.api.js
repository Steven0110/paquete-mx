(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('shippingApi', shippingApi);

  shippingApi.$inject = ['$q', 'storage','parse'];

  /* @ngInject */

  function shippingApi($q, storage, parse) {

    var factory = {
      setShipping  : setShipping,
      getShipping  : getShipping,
      getOrder     : getOrder,
      sendPickUp   : sendPickUp,
      cancelPickup : cancelPickup,
      getInvoices : getInvoices,
      getTracking : getTracking,
      getPayments : getPayments,
      getOutcomes : getOutcomes
    };

    return factory;

    function cancelPickup(params){
      var deferred = $q.defer();
      var Cloud = parse.cloud('cancelPickup');
      Cloud.post(params).then(function(res){
        if(res.result);
          res = res.result;
        deferred.resolve(res);
      },function(err){
        console.log(err);
        if(err.data && err.data.error){
          err = {error:true, message:err.data.error};
        }
        deferred.reject(err);
      });

      return deferred.promise;
    }

    function sendPickUp(params){
      var deferred = $q.defer();
      var Cloud = parse.cloud('sendPickUp');
      Cloud.post(params).then(function(res){
        if(res.result);
          res = res.result;
        deferred.resolve(res);
      },function(err){
        console.log(err);
        if(err.data && err.data.error){
          err = {error:true, message:err.data.error};
        }
        deferred.reject(err);
      });

      return deferred.promise;
    }

    function setShipping(shipping){
      return storage.set('shipping', shipping);
    }

    function getShipping(){
      var shipping = storage.get('shipping');
      if(shipping && shipping.from && shipping.to)
        return shipping;
      else
        return false;
    }

    function getTracking(shippingId){
      var Tracking = parse.endpoint("Tracking");
      var where = {"Shipping":{"__type":"Pointer","className":"Shipping","objectId":shippingId}};
      return Tracking.getAll(where);
    }

    function getInvoices(shippingId){
      var Invoice = parse.endpoint('Invoice');
      var where = {"shipping":{"__type":"Pointer","className":"Shipping","objectId":shippingId}};
      return Invoice.getAll(where);
    }

    function getPayments(shippingId){
      var Payment = parse.endpoint('Payment');
      var where = {"shipping":{"__type":"Pointer","className":"Shipping","objectId":shippingId},"UUID":{"$exists":true}};
      return Payment.getAll(where);
    }

    function getOutcomes(shippingId){
      var Outcome = parse.endpoint('Outcome');
      var where = {"shipping":{"__type":"Pointer","className":"Shipping","objectId":shippingId}};
      return Outcome.getAll(where);
    }

    function getOrder(trackId){
      var where = {'trackingNumber':trackId};
      var Shipping = parse.endpoint('Shipping');
      return Shipping.getFirst(where);
    }
      
  }
    
})();