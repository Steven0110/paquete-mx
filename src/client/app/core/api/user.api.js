(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('userApi', userApi);

  userApi.$inject = ['$q', 'parse','parseheaders', 'storage','accountApi'];

  /* @ngInject */
  function userApi($q, parse, parseheaders ,storage, accountApi) {

    var factory = {
      login             : login,
      register          : register,
      logout            : logout,
      isAuth            : isAuth,
      setCurrentUser    : setCurrentUser,
      getCurrentUser    : getCurrentUser,
      currentUser       : currentUser,
      saveAddress       : saveAddress,
      getAddresses      : getAddresses,
      getAddress        : getAddress,
      getCards          : getCards,
      getPayments       : getPayments ,
      getOrders         : getOrders,
      deleteAddress     : deleteAddress,
      updateProfile     : updateProfile,
      updatePassword    : updatePassword,
      updateTaxInfo     : updateTaxInfo,
      checkPassword     : checkPassword,
      setSessionByToken : setSessionByToken
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

    function updateProfile(params){
      var User = parse.user(params.objectId);
      return User.one().customPUT(params);
    }

    function updateTaxInfo(user,invoice, taxInfo){
      var User = parse.user(user.objectId);
      var data = {};

      console.log(invoice);
      if(invoice){
        data = {invoice: true, taxId: taxInfo.taxId, taxName: taxInfo.taxName, taxUse: taxInfo.taxUse};
      }else{
        data = {invoice: false};
      }

      return User.one().customPUT(data);
    }

    function checkPassword(params){
      var Login = parse.login();
      return Login.one().get(params);
    }

    function updatePassword(user,oldPassword, newPassword){
      return this.checkPassword({username:user.username, password:oldPassword}).then(function(user){
        var User = parse.user(user.objectId);
        return User.one().customPUT({password: newPassword});
      });
    }

    function setSessionByToken(token){
      parseheaders.restKeys['X-Parse-Session-Token'] = token;
    }

    function register(accountType,account,params) {
      var deferred = $q.defer();
      logout();
      delete parseheaders.restKeys['X-Parse-Session-Token'];
      account.type = accountType;
      // alert(account.type);
    
      var User = parse.user();
      var currentUser;
      User.post(params).then(function(user){
        currentUser = user;
        setSessionByToken(user.sessionToken);
        return accountApi.update(account);

      }).then(function(account){
        var params = {
          objectId: currentUser.objectId
        }
        params.account = {"__type":"Pointer","className":"Account","objectId":account.objectId};
        return updateProfile(params);
      }).then(function(){
        return factory.getCurrentUser();
      }).then(function(user){
        var timestamp = Math.floor(Date.now() / 1000);
        storage.set('user',user);
        storage.set('timestamp',timestamp);
        deferred.resolve(user);
      },function(error){
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
          
      params.user = {"__type":"Pointer","className":"_User","objectId":userId};
      
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

    function getCards(userId){

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
      var Card = parse.endpoint('Card');
      return Card.getAll(where,'-createdAt');
    }


    function getPayments(userId){

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
      var Payment = parse.endpoint('Payment');
      return Payment.getAll(where,'-createdAt');
    }

    function getOrders(delivered,userId){

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
      if(delivered == true){
        where.delivered = true;
      }else if(delivered == false){
        where.delivered = false
      }
      var Shipping = parse.endpoint('Shipping');
      return Shipping.getAll(where,'-createdAt');
    }

    function getAddress(objectId){
      var Address = parse.endpoint('Address');
      return Address.get(objectId);
    }

    function deleteAddress(objectId){
      return parse.endpoint('Address').remove(objectId);
    }

    function currentUser() {
      var user = storage.get('user');
      if(user && user.objectId){
        return user;
      }else{
        return false;
      }
    }

    function setCurrentUser(user){
      return storage.set('user', user);
    }

    function setSessionByToken(token){
      parseheaders.restKeys['X-Parse-Session-Token'] = token;
    }
  }
})();