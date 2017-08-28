(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('template', template);

  template.$inject = ['$http', '$templateCache', '$q'];

  /* @ngInject */
  function template($http, $templateCache, $q) {

    var factory = {
      get: get
    };

    return factory;

    function get(file) {
      // Search for template in $templateCache, if found, return it, otherwise, search for template in given path.
      if ($templateCache.get(file)) {
        var ext = file.substr(file.length - 5, file.length);
        if (ext === '.json') {
          var deferred = $q.defer();
          deferred.resolve(JSON.parse($templateCache.get(file)));
          return deferred.promise;
        } else {
          return $templateCache.get(file);
        }
      } else {
        return $http.get(file)
          .then(function(result) {
            return result.data; 
          });
      }
    }
  }

})();