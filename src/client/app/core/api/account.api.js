(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('accountApi', accountApi);

  accountApi.$inject = ['$q','parse'];

  /* @ngInject */
  function accountApi($q, parse) {
    
    var factory = {
      update : update
    };

    return factory;

    function update(params){
      var Account = parse.endpoint("Account");
      return Account.update(params);
    }

    // function getByUser(user){
    //   var Account = parse.endpoint("Account");
    //   if(user && user.account && user.account.objectId){
    //     var objectId = user.account.objectId;
    //     return Account.get(objectId);
    //   }
    //   else{
    //     userApi.getCurrentUser().then(function(user){
    //       if(user && user.account && user.account.objectId){
    //         var objectId = user.account.objectId;
    //         return Account.get(objectId);
    //       }else{
    //         var deferred = $q.defer();
    //         deferred.reject({session: false,message:"Invalid session"});
    //         return deferred.promise;
    //       }

    //     },function(err){
    //       var deferred = $q.defer();
    //       deferred.reject(err);
    //       return deferred.promise;
    //     })
    //   }
    // }
  }
})();
