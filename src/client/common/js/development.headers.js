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

      }
    };
  }
})();
