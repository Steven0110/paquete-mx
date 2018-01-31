(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('paymentGateway', paymentGateway);

  paymentGateway.$inject = ['$q', 'parse', 'parseheaders'];

  /* @ngInject */
  function paymentGateway($q, parse) {

    var conekta = {
      update : update,
      remove : remove
    }

    return conekta;


    function remove(cardId){
      var Card = parse.endpoint('Card');
      return Card.remove(cardId);
    }

    function update(card){
      var deferred = $q.defer();
      var Cloud = parse.cloud('saveCard');
      Cloud.post(card).then(function(res){
        if(res.result)
          res = res.result
        deferred.resolve(res);
      },function(err){
        if(err.data){
          err  = err.data;
          if(err.error){
            err = err.error;
            if(err.text){
              err = JSON.parse(err.text);
            }
          }
        }
        deferred.reject(err);
      });
      return deferred.promise;
    }

  }
})();