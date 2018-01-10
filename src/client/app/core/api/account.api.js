(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('accountApi', accountApi);

  accountApi.$inject = ['$q','parse'];

  /* @ngInject */
  function accountApi($q, parse) {
    var Account = parse.endpoint("Account");
    var factory = {
      update : update,
      getByUser: getByUser
    };

    return factory;

    function update(params){
      return Account.update(params);
    }

    function getByUser(user){
      if(user){
        var objectId = user.account.objectId;
        return Account.get(objectId);
      }else{
        alert("User is required");
      }
    }
  }
})();
