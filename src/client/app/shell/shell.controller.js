(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Shell',Shell);

  Shell.$inject = ['$scope','template','$mdToast'];


  function Shell($scope, template, $mdToast){
    // jshint validthis: true 
    var shell = this;
    shell.labels = false;


    template.get('app/lang/es.json').then(function(labels){
      shell.labels = labels;
    },function(err){
      console.log(err);
    });
  };
})();