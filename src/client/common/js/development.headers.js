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
        'X-Parse-Application-Id': 'HCGa3edfKjokvwNQRuDgtZsjL5BYyJ6r9jm8aBmT',
        'X-Parse-REST-API-Key': 'wSO0vXjzy6jOKwRfYBEoVPlKYzu6oZKrJuV9rE2H'
      },
      javascriptKeys:{
        'applicationID' : 'HCGa3edfKjokvwNQRuDgtZsjL5BYyJ6r9jm8aBmT',
        'javascriptKey':'r3uce4uCbPp3siNMuvG4KIdalRD3wzYvKCdyvlrJ'

      }
    };
  }
})();
