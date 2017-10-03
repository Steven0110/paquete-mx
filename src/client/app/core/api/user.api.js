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
      logout          : logout,
      isAuth          : isAuth,
      setCurrentUser  : setCurrentUser,
      getCurrentUser  : getCurrentUser,
      currentUser     : currentUser,
      saveAddress     : saveAddress,
      getAddresses    : getAddresses,
      getAddress      : getAddress,
      deleteAddress   : deleteAddress
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

    function isAuth() {
      return storage.get('user');
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

    function logout(){
      storage.remove('user');
    }

    function getCurrentUser(){
      return parse.current().one().get();
    }

    function saveAddress(params, userId){
      if(!userId){
        var user = currentUser();
        if(user && user.objectId){
          userId = user.objectId;
        }else{
          var deferred = $q.defer();
          deferred.reject({noSession:true});
          return deferred.promise;
        }
      }
      if(params.objectId){
      }else{
        params.user = {"__type":"Pointer","className":"_User","objectId":userId};
      }
      var Address = parse.endpoint('Address');
      return Address.update(params);
    }

    function getAddresses(userId){

      if(!userId){
        var user = currentUser();
        if(user && user.objectId){
          userId = user.objectId;
        }else{
          var deferred = $q.defer();
          deferred.reject({noSession:true});
          return deferred.promise;
        }
      }

      var where = {"user":{"__type":"Pointer","className":"_User","objectId":userId}}
      var Address = parse.endpoint('Address');
      return Address.getAll(where,'createdAt');
    }

    function getAddress(objectId){
      var Address = parse.endpoint('Address');
      return Address.get(objectId);
    }

    function deleteAddress(objectId){
      return parse.endpoint('Address').remove(objectId);
    }

    function currentUser() {
      return storage.get('user');
    }

    function setCurrentUser(user){
      return storage.set('user', user);
    }

    function setSessionByToken(token){
      parseheaders.restKeys['X-Parse-Session-Token'] = token;
    }
  }
})();