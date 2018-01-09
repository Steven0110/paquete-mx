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
      update : update
    };

    return factory;

    function update(params){
      return Account.update(params);
    }
  }
})();
