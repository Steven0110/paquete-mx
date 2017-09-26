(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Home',Home);

  Home.$inject = ['$scope','$q','$timeout','template','rateApi'];

  function Home($scope, $q, $timeout, template, rateApi){
    // jshint validthis: true 
    var home = this;
    var shell = $scope.shell;
    var index = 1;
    home.cities = {};
    home.countries = {};
    home.options = [];


    template.get('app/countries/mx.json').then(function(cities){
      home.cities = cities;
    },function(err){
      console.log(err);
    });

    template.get('app/countries/countries.json').then(function(countries){
      home.countries = countries;
    },function(err){
      console.log(err);
    });

    // function delaySearch(term, flag,callback){
    //   if(!flag){
    //     flag = $timeout(function(){
    //       if(term && term.length > 2){
    //         var search = JSON.search(home.cities, '//*[contains(asentamiento, "'+term+'") or contains(CP, "'+term+'")]');
    //         home.options = search; 
    //         console.log("times");
    //         $timeout.cancel(flag);
    //       }else{
    //         $timeout.cancel(flag);
    //         home.options = [];
    //       }
    //       return callback(false);
    //     },500);
    //   }else{
    //     console.log('done');
    //     return callback(flag);
    //   }
    // }

    home.selectItem = function(item){
      home.shipping.from.zip = item;
      home.options = [];
    }

    home.active = false;
    home.sections = [
      {
        open: false
      },
      {
        open: false
      },
      {
        open: false
      },
      {
        open: false
      },
      {
        open: false
      },
      {
        open: false
      },
      {
        open: false
      }
    ];
    home.rated = false;
    home.searching = false;
    home.services = [];

    home.shipping ={
      from:{
        search: null,
        data: null
      },
      to:{
        search: null,
        data: null
      },
      type: "envelope",
      package:{
        weight: null,
        width: null,
        length: null,
        height: null
      }
    }

    // angular.element(document).on('click', function () {
      
    // });

    var menu = $('#menu').innerHeight();

    home.openSection = function(index){
      $('.benefits-'+index).slideDown(500);
    }

    home.cleanSearch = function(type){
      if(home.shipping[type].data){
        home.shipping[type].data =  null;
        home.shipping[type].search = null;
      }
    }

    home.closeSection = function(index){
      $('.benefits-'+index).slideUp(500);
    };

    home.send = function(){
      home.list = [];
      if(home.shippingForm.$valid){
        if(home.shipping.type == 'box' || home.shipping.type == 'documents'){
          home.rated =  true;
          home.searching =  true;
          var viewport = $('.image-space').innerHeight();
          var body = $('body').innerHeight();
          var topContent = $('.image-space').innerHeight();
          if(viewport <= body){
            $('body,html').stop().animate({scrollTop:topContent/2},1000);
          }else{
            $('body,html').stop().animate({scrollTop:topContent/2},1000);
          }
          
          var services = ["ups","fedex","redpack"];
          var rate = {
            "from": {
              "zip": home.shipping.from.data.CP,
              "country": home.shipping.from.country
            },
            "to": {
              "zip": home.shipping.to.data.CP,
              "country": home.shipping.to.country
            },
            "packages":[home.shipping.package]
          };
          var promises = [];
          angular.forEach(services,function(service){
            var params = {
              "type":service,
              "rate": rate
            };
            promises.push(
              rateApi.rate(service,params).then(function(response){
                console.log(response);
                if(response.services){
                  home.services = home.services.concat(response.services);
                }
                var deferred = $q.defer();
                deferred.resolve(response);
                return deferred.promise;
              },function(err){
                console.log(err);
                var deferred = $q.defer();
                deferred.reject(err);
                return deferred.promise;
              })
            );
          });
          $q.all(promises).then(function(result){
          },function(err){
            console.log(err);
          }).finally(function(){
            console.log(home.services);
            home.searching = false;
          });

          
        }
      }
    };


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
        var menuTop = $('#menu').offset().top;

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
      if(index <= home.sections.length){
        var sectionDistance = scroll+(distance-viewport)+menu;
        if( sectionDistance+200 >= $('.section-'+index).position().top ){
          $('.image-'+index).addClass('active')
          index++;
        }
      }
    
    });
  };
})();