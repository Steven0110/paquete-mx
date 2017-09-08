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

    home.active = false;

    var menu = $('#menu').innerHeight();
    // alert($('.image-space').height());
    // $('.image-space').height(600);
    // var viewport = $('.image-space').height();
    // var body = $('body').height();
    var floatSection = $('#float-section').offset().top;

    function setHomeState(status){
      home.active = status;
      $scope.$digest();
    }

    $(window).scroll(function (event) {
      var viewport = $('.image-space').innerHeight();
      var body = $('body').innerHeight();
      var difference = viewport-body;

      var scroll = $(window).scrollTop();
      var distance =  difference > 0 ?scroll-difference:scroll+difference;

      if(scroll >= difference){
        $('#float-section').css({top:-(distance)});
        $('#menu').css({'position':'absolute',top:-(menu)});
        $('#float-section').innerHeight($('#float-section').innerHeight()-distance);
        // var menuTop = $('#menu').offset().top;
        var menuTop =0;

        if(menuTop-scroll <= 0){
          $('#menu').css({position:'fixed',top:0});
          if(!home.active)
            setHomeState(true);

        }else{
          $('#menu').css({'position':'absolute',top:-(menu)});
        }
        
      }else{
        if(scroll <= body ){
          setHomeState(false);
          $('#menu').css({'position':'fixed', top:"auto"});
        }
      }

      /* section animation */
      // console.log($('.section-1').position().top);
      if( scroll+(distance-viewport) >= $('.section-3').position().top ){
        console.log('triggered');
      }
    
    });


  };
})();