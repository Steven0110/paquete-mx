(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('userApi', userApi);

  userApi.$inject = ['$q', 'parse','parseheaders', 'storage'];

  /* @ngInject */
  function userApi($q, parse, parseheaders ,storage ) {

    var factory = {
      login           : login,
      register        : register,
      setCurrentUser  : setCurrentUser
    };

    return factory;

    function login(params) {
      var deferred = $q.defer();
      var Login = parse.login();
      Login.one().get(params).then(function(user){
        setSessionByToken(user.sessionToken);
        var timestamp = Math.floor(Date.now() / 1000);
        storage.set('user',user);
        storage.set('timestamp',timestamp);
        deferred.resolve(user);
      },function(error){
        deferred.reject(error);
      });
      return deferred.promise
    }

    function register(params) {
      var deferred = $q.defer();
      var User = parse.user();
      User.post(params).then(function(user){
        setSessionByToken(user.sessionToken);
        return factory.getCurrentUser();
      }).then(function(user){
        var timestamp = Math.floor(Date.now() / 1000);
        storage.set('user',user);
        storage.set('timestamp',timestamp);
        deferred.resolve(user);
      },function(error){
        console.log(error);
        deferred.reject(error);
      });

      return deferred.promise
    }

    function setCurrentUser(user){
      return storage.set('user', user);
    }

    function setSessionByToken(token){
      parseheaders.restKeys['X-Parse-Session-Token'] = token;
    }
  }
})();