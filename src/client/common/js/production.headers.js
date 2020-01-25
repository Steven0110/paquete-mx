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
      apiKeys: {
        invoiceApiKey: "JVIRtH6RWx9bI9eBPhNzx81noAerPPlW5KOw0Grz"
      },
      apiEndpoint:{
        "baseUrl": "https://r8v9vy7jw5.execute-api.us-west-2.amazonaws.com/api",
        "internationalInvoice": "https://3n8dxvs0w1.execute-api.us-west-2.amazonaws.com/prod/pmx-international-invoice",
        "downloadInvoice": "http://52.89.200.43/endpoint/download.php",
        "downloadLabel": "http://54.201.237.120?trackingNumber=",
        "invoice": "https://or56mhirwj.execute-api.us-west-2.amazonaws.com/prod/",
      },
      conekta: {
        key: "key_XzkDy9QygkjzZR98m4hVR6A"
      }
    };
  }
})();
