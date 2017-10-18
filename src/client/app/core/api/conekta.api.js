(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('conektaApi', conektaApi);

  conektaApi.$inject = ['$q', 'parse', 'parseheaders'];

  /* @ngInject */
  function conektaApi($q, parse, parseheaders) {
    var conketaPublicKey = parseheaders.conektaKeys.public;

    var conekta = {
      update : update,
      getCards : getCards,
      remove : remove
    }

    return conekta;


    function remove(cardId){
      var deferred = $q.defer();
      var Cloud = parse.cloud('removeCard');
      Cloud.post({cardId: cardId}).then(function(result){
        deferred.resolve(result.result);
      },function(error){
        deferred.reject(error);
      });

      return deferred.promise;
    }

    function getCards(){
      var deferred = $q.defer();
      var Cloud = parse.cloud('getCustomer');
      Cloud.post({}).then(function(customer){
        if(customer.result && customer.result.data && customer.result.data.payment_sources){
          var cards = customer.result.data.payment_sources.data;
          if(cards){
            if(cards.length > 0){
              deferred.resolve(cards);
            }else{
              deferred.resolve(false);
            }
          }
        }else{
          deferred.resolve(false);
        }
      },function(error){
        deferred.resolve(error);
      });

      return deferred.promise;
    }

    function update(card, conektaId){
      var deferred = $q.defer();
      console.log(Conekta);
      // Conekta.setPublishableKey(conketaPublicKey);
      var errorResponseHandler,
          successResponseHandler,
          tokenParams;

      tokenParams = {card:card};

      successResponseHandler = function(token) {
        var params = {token:token.id, conektaId: conektaId};
        var Cloud = parse.cloud('saveCard');
        Cloud.post(params).then(function(result){
          deferred.resolve(result.result);
        },function(error){
          console.log(error);
          deferred.reject(error);
        });
      };

      errorResponseHandler = function(error) {
        console.log(error);
        deferred.reject(error)
      };

      Conekta.Token.create(tokenParams, successResponseHandler, errorResponseHandler);
      return deferred.promise;

    }

  }
})();