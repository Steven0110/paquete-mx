(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Home',Home);

  Home.$inject = ['$scope','$q'];


  function Home($scope, $q){
    // jshint validthis: true 
    var home = this;
    var shell = $scope.shell;

    var viewport = $('.image-space').height();
    var body = $('body').height();

    var floatSection = $('#float-section').offset().top;

    $(window).scroll(function (event) {
      var viewport = $('.image-space').height();
      var body = $('body').height();
      var difference = viewport-body;
      if(difference > 0){
        var scroll = $(window).scrollTop();
        if(scroll >= difference){
          var distance = scroll-difference;
          $('#float-section').css({top:-(distance)});
          $('#float-section').height($('#float-section').height()-distance);
          console.log($('#float-section').height());
        }
      }
    });


  };
})();