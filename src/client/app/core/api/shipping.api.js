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
      getOrder     : getOrder
    };

    return factory;


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

    function getOrder(trackId){
      var where = {'trackingNumber':trackId};
      var Shipping = parse.endpoint('Shipping');
      return Shipping.getFirst(where);
    }
      
  }
    
})();