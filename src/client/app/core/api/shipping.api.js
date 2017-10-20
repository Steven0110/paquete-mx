(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('shippingApi', shippingApi);

  shippingApi.$inject = ['$q', 'storage'];

  /* @ngInject */

  function shippingApi($q, storage) {

    var factory = {
      setShipping  : setShipping,
      getShipping  : getShipping
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
      
  }
    
})();