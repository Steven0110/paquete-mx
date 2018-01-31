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
      setSessionByToken : setSessionByToken,
      recovery          : recovery,
      getKey            : getKey,
      setPassword       : setPassword,
      getByUser         : getByUser
    };

    return factory;

    function setPassword(params){
      var deferred = $q.defer();
      var Cloud = parse.cloud('setPassword');
      Cloud.post(params).then(function(res){
        if(res.result)
          deferred.resolve(res.result);
        else
          deferred.resolve(res);
      },function(err){
        deferred.reject(err);
      });

      return deferred.promise;
    }

    function getKey(recoveryKey){
      var deferred = $q.defer();
      var Cloud = parse.cloud('validateKey');
      Cloud.post({key:recoveryKey}).then(function(res){
        if(res.result)
          deferred.resolve(res.result);
        else
          deferred.resolve(res);
      },function(err){
        deferred.reject(err);
      });

      return deferred.promise;
    }


    function recovery(email){
      var deferred = $q.defer();
      var Cloud = parse.cloud('recoveryPassword');
      Cloud.post({email:email}).then(function(res){
        if(res.result)
          deferred.resolve(res.result);
        else
          deferred.resolve(res);
      },function(err){
        deferred.reject(err);
      });

      return deferred.promise;
    }

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

    function getByUser(user){
      var Account = parse.endpoint("Account");
      if(user && user.account && user.account.objectId){
        var objectId = user.account.objectId;
        return Account.get(objectId);
      }
      else{
        return this.getCurrentUser().then(function(user){
          if(user && user.account && user.account.objectId){
            var objectId = user.account.objectId;
            return Account.get(objectId);
          }else{
            var deferred = $q.defer();
            deferred.reject({session: false,message:"Invalid session"});
            return deferred.promise;
          }

        },function(err){
          var deferred = $q.defer();
          deferred.reject(err);
          return deferred.promise;
        })
      }
    }

    function updateTaxInfo(invoice, taxInfo){
      return factory.getCurrentUser().then(function(user){
        if(user){
          return getByUser(user);
        }else{
          var deferred = $q.defer();
          deferred.reject({session: false,message:"Invalid session"});
          return deferred.promise;
        }
      }).then(function(account){
        return accountApi.validateTaxId(taxInfo.taxId).then(function(res){
          if(res && res.valid){
            if(account){
              account.invoice = invoice;
              if(taxInfo.taxId)
                account.taxId = taxInfo.taxId;
              if(taxInfo.taxName)
                account.taxName = taxInfo.taxName;
              if(taxInfo.taxUse)
                account.taxUse = taxInfo.taxUse;
              return accountApi.update(account);
            }
            else{
              var deferred = $q.defer();
              deferred.reject({message:"Invalid account"});
              return deferred.promise;
            }
          }else{
            var deferred = $q.defer();
            deferred.reject({invalidTaxId:true});
            return deferred.promise;
          }
        });
      });
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
    
      var User = parse.user();
      var currentUser;
      User.post(params).then(function(user){
        setSessionByToken(user.sessionToken);
        return getCurrentUser();
      }).then(function(user){

        currentUser = user;

        if(currentUser && currentUser.name && currentUser.lastname)
          account.name = currentUser.name+' '+currentUser.lastname;

        return accountApi.update(account);

      }).then(function(account){
        var params = {
          objectId: currentUser.objectId
        }
        params.account = {"__type":"Pointer","className":"Account","objectId":account.objectId};
        // params.accountType = accountType;
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
      return Payment.getAll(where,'-createdAt','shipping');
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
      return Shipping.getAll(where,'-createdAt',false,1000,0);
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