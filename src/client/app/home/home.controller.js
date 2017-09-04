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
    var menu = $('#menu').height();

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
          $('#menu').css({'position':'absolute',top:-(menu)});
          $('#float-section').height($('#float-section').height()-distance);
          var menuTop = $('#menu').offset().top;

          if(menuTop-scroll <= 0){
            $('#menu').css({position:'fixed',top:0});
          }else{
            $('#menu').css({'position':'absolute',top:-(menu)});
          }
          
        }
      }

      if(scroll <= 0){
        $('#menu').css({'position':'fixed', top:"auto"});
      }


    });


  };
})();