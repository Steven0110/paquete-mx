(function() {
  'use strict';

  angular
  .module('app.core')
  .factory('parseheaders', parseheaders);

  parseheaders.$inject = [];

  /* @ngInject */
  function parseheaders() {

    return {
      restKeys: {
        'Content-Type': 'application/json',
        'X-Parse-Application-Id': 'OwwqTBzf9Tj618RyQqYmx3eJOhxaS8qolcojD3IA',
        'X-Parse-REST-API-Key': 'DLHH84SFEY7bIvAmKINC73x8kj54zwDSkDTN0Whi'
      },
      javascriptKeys:{
        'applicationID' : 'OwwqTBzf9Tj618RyQqYmx3eJOhxaS8qolcojD3IA',
        'javascriptKey':'gCi0VgG0NVmtZA7lKsAAVVAvk9IwECg2GMJHwWdQ'
      }
    };
  }
})();
