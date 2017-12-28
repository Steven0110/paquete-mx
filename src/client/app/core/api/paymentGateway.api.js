(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('paymentGateway', paymentGateway);

  paymentGateway.$inject = ['$q', 'parse', 'parseheaders'];

  /* @ngInject */
  function paymentGateway($q, parse) {

    var conekta = {
      update : update
    }

    return conekta;

    function update(card){
      var deferred = $q.defer();
      var Cloud = parse.cloud('saveCard');
      Cloud.post(card).then(function(res){
        if(res.result)
          res = res.result
        deferred.resolve(res);
      },function(err){
        deferred.reject(err);
      });
      return deferred.promise;
    }

  }
})();