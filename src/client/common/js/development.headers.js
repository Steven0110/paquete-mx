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
        'X-Parse-Application-Id': 'OaKte4Imh3dk5JIhsJoLAcLaPYMb2mQUeqyHXrP1',
        'X-Parse-REST-API-Key': 'UBQ8RP6ldzRJTFeBoTtqVsXtfFwsPQDznP1lr48y'
      },
      javascriptKeys:{
        'applicationID' : 'OaKte4Imh3dk5JIhsJoLAcLaPYMb2mQUeqyHXrP1',
        'javascriptKey':'wcFLh2UROrO8fN9SbFbgbeOZTZOlPu3YkAMys1bL'
      },
      debugging: true,
      production: false,
      apiKeys: {
        invoiceApiKey: "7TC3P6Nste3PyhT3lhOYG1aCeZmO1QKC8ds15dDK"
      },
      apiEndpoint:{
        "baseUrl": "https://mqxt7kvlib.execute-api.us-west-2.amazonaws.com/dev",
        "internationalInvoice": "https://arnjlj6h6g.execute-api.us-west-2.amazonaws.com/dev/pmx-international-invoice",
        "downloadInvoice": "http://52.89.200.43/development/download.php",
        "downloadLabel": "http://54.201.237.120/dev.php?trackingNumber=",
        "invoice": "https://or56mhirwj.execute-api.us-west-2.amazonaws.com/dev/",
      }
    };
  }
})();
