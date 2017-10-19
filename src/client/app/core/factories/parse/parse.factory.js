(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('parse', parse);

  parse.$inject = ['$q', 'Restangular', 'parseheaders'];

  /* @ngInject */
  function parse($q, Restangular, parseheaders) {

    Restangular.setBaseUrl('https://parseapi.back4app.com/');
    Restangular.setDefaultHeaders(parseheaders.restKeys);

    var factory = {
      cloud     : cloud,
      endpoint  : endpoint,
      current   : current,
      user      : user,
      login     : login
    };

    return factory;

    function cloud(cloudFunction){
      Restangular.setBaseUrl('https://parseapi.back4app.com/');
      Restangular.setDefaultHeaders(parseheaders.restKeys);
      return Restangular.service('functions/'+cloudFunction);
    }

    function login(){
      return Restangular.service('login');
    }

    function endpoint(className, id){
      return new ParseClass(className, id);
    }

    function current(){
      return Restangular.service('users/me');
    }

    function user(userId){
      var user = 'users';
      if(userId)
        user = 'users/'+userId;
      return Restangular.service(user);
    }

    function ParseClass(className, id){ 

      var className = className;
      var id = id;
      var endpoint = null;
      var restObject;

      initialize(className, id);

      function initialize(newClassName, newId){
        
        className =  newClassName;
        id = newId;

        endpoint = 'classes/'+className;
        if(newId)
          endpoint += '/'+newId;

        restObject = Restangular.service(endpoint);
        
      }


      function getObject(){
        var deferred = $q.defer();
        restObject.one().get().then(function(result){
          deferred.resolve(result)
        },function(error){
          deferred.resolve(false);
        });
        return deferred.promise;
      }

      return {
        setId : function(id){
          return initialize(className, id);
        },
        remove: function(id){
          this.setId(id);
          return restObject.one().remove();
        },
        getAll: function(where, order, include, limit, skip){
          this.setId(false);
          var  params= {};
          if(where)
            params.where = where;
          if(order)
            params.order = order;
          if(include)
            params.include = include;
          if(limit)
            params.limit = limit;
          if(skip)
            params.skip = skip;

          return restObject.getList(params);
        },
        getFirst : function(params){
          var deferred = $q.defer();

          this.getAll(params).then(function(items){
            if(items.length > 0)
              deferred.resolve(items[0]);
            else
              deferred.resolve(false);
          },function(error){
            deferred.reject(error);
          });

          return deferred.promise;
        },
        get: function(id, include){
          this.setId(id);
          var params = {};
          if(include)
            params.include = include;

          return getObject(params);
        },
        post: function(params){
          return restObject.post(params);
        },
        put: function(params){
          return restObject.one().customPUT(params);
        },
        update: function(params){
          var object;
          var deferred = $q.defer();
          id = params && params.objectId ? params.objectId : false;
          this.setId(id);
          if(id){
            this.put(params).then(function(){
              return getObject();
            }).then(function(row){
              deferred.resolve(row)
            },function(error){
              deferred.reject(error);
            });
          }
          else{
            this.post(params).then(function(updated){
              initialize(className,updated.objectId);
              return getObject();
            }).then(function(row){
              deferred.resolve(row);
            },function(error){
              deferred.reject(error);
            });
          }

          return deferred.promise;
        }
      }
    }

  }
})();