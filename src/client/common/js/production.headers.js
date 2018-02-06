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
      },
      debugging: false,
      production: true,
      apiEndpoint:{
        "baseUrl": "https://r8v9vy7jw5.execute-api.us-west-2.amazonaws.com/api",
        "downloadInvoice": "http://54.244.218.15/endpoint/download.php",
        "downloadLabel": "http://54.245.38.66?trackingNumber="
      }
    };
  }
})();
