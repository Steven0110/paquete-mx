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
    // var citiesAllowed = ['mx','us','ca','ar'];
    home.fromCities = {};
    home.toCities = {};
    home.countries = {};
    home.options = [];
    home.international = false;


    home.shipping ={
      from:{
        search: null,
        data: null,
        country: null
      },
      to:{
        search: null,
        data: null,
        country: null
      },
      type: "envelope",
      package:{
        weight: "1",
        width: "25",
        length: "25",
        height: "25"
      }
    }

    $timeout(function(){

      template.get('app/countries/countries.json').then(function(countries){
        home.countries = countries;
      },function(err){
        console.log(err);
      });
      
    },500);

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

    // function loadCities(country, section){
    //   console.log(country);
    //   if(citiesAllowed.indexOf(country) >= 0 ){
    //     shell.showLoading();
    //     template.get('app/countries/'+country+'.json').then(function(cities){
    //       var snapshot = Defiant.getSnapshot(cities);
    //       home[section] = snapshot;
    //       shell.hideLoading();
    //     },function(err){
    //       console.log(err);
    //     });
    //   }
    // }

    $scope.$watch('home.shipping.to.country',function(newVal, prevVal){
      if(prevVal != newVal){
        if(newVal && newVal.code){
          home.shipping.to.search = null;
          // loadCities(newVal.code,'toCities');
        }
      }
    });

    home.closeSection = function(index){
      $('.benefits-'+index).slideUp(500);
    };



    home.send = function(){

      home.list = [];
      if(home.shippingForm.$valid){
        var fromCountry = home.shipping.from.country.code;
        var toCountry = home.shipping.to.country.code;
        home.international =  shell.isInternational(fromCountry, toCountry);
        console.log('international', home.international);
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
          
          var services = [{code:"ups", international:true},{code:"fedex",international:true},{code:"redpack",international:false}];

          var fromZip;
          if(home.shipping.from.data && home.shipping.from.data.zip){
            fromZip =  home.shipping.from.data.zip;
          }else{
            fromZip =  home.shipping.from.search;
          }

          var toZip;
          if(home.shipping.to.data && home.shipping.to.data.zip){
            toZip =  home.shipping.to.data.zip;
          }else{
            toZip =  home.shipping.to.search;
          }
          


          var rate = {
            "from": {
              "zip": fromZip,
              "country": fromCountry
            },
            "to": {
              "zip": toZip,
              "country": toCountry
            },
            "packages":[home.shipping.package]
          };
          var promises = [];
          angular.forEach(services,function(service){

            var runRate = true; 
            if(home.international && !service.international){
              console.log('service no international'+service.code);
              runRate = false;
            }

            if(runRate){
              var params = {
                "type":service.code,
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
            }
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