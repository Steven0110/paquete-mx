(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Home',Home);

  Home.$inject = ['$state','$scope','$q','$timeout','template','rateApi','Dialog'];

  function Home($state, $scope, $q, $timeout, template, rateApi, Dialog){
    // jshint validthis: true 
    var home = this;
    var shell = $scope.shell;
    var index = 1;
    home.fromCities = {};
    home.toCities = {};
    home.countries = shell.countries;
    home.options = [];
    home.international = false;

      
    $scope.$watch('home.shipping.from.country',function(newVal, oldVal){
      home.shipping.from.data = {};
      home.fromSearch  = null;
    });

    $scope.$watch('home.shipping.to.country',function(newVal, oldVal){
      home.shipping.to.data = {};
      home.toSearch  = null;
    });



    /*nuevo diseño*/
    home.weightList = ["1","2","3","4","5","6","7","8","9","10"];
    home.weightDocuments = 1;
    home.selectType = function(type){
      home.shipping.type = type;
      if(type == 'package'){
        home.documentOpen = false;
        home.packageOpen = !home.packageOpen;        
      }
      else if(type == 'document'){
        home.packageOpen = false;
        home.documentOpen = !home.documentOpen;        
      }
    }

    home.updateWeight = function(packageInfo){
      if(packageInfo.weight){
        packageInfo.weight = parseFloat(packageInfo.weight).toFixed(2);
        packageInfo.real = parseFloat(packageInfo.weight);
        // packageInfo.weight = parseFloat(packageInfo.weight);
      }else{
        packageInfo.weight = packageInfo.weight;
        packageInfo.real = false;
      }

    }

    home.calculateVW = function(packageInfo){

      var height = 0;
      var width = 0;
      var length = 0;

      if(packageInfo.height){
        height = parseFloat(packageInfo.height);
      }

      if(packageInfo.width){
        width = parseFloat(packageInfo.width);
      }

      if(packageInfo.length){
        length = parseFloat(packageInfo.length);
      }

      if(height > 0 && width > 0 && length > 0){
        packageInfo.volumetric = ((height*width*length)/5000).toFixed(2);
        packageInfo.volumetric = parseFloat(packageInfo.volumetric);
        if(packageInfo.weight)
          packageInfo.real = parseFloat(packageInfo.weight);
      }else{
        packageInfo.volumetric = false;
      }

    }

    home.documents = [{
      weight: "0.5",
      width: "25",
      length: "25",
      height: "1"
    }]

    home.initialize ={
      from:{
        zip: null,
        data: {},
        country: false
      },
      to:{
        zip: null,
        data: {},
        country: false
      },
      type: null,
      valueDeclared: null,
      insurance: false,
      packages:[{
        weight: null,
        width: null,
        length: null,
        height: null,
        volumetric: false
      }
      ]
    };

    home.shipping = JSON.parse(JSON.stringify(home.initialize));

    home.describeWeight = function(){
      Dialog.showTooltip("¿Cómo se calcula el peso volumétrico?","El costo de un envío puede ser afectado por la cantidad de espacio que éste ocupa en el transporte, más que por su peso real. A esto se les llama el peso volumétrico (o dimensional).<br/></br/> El peso volumétrico se calcula multiplicando el alto, largo y ancho del paquete y diviendolo entre 5000: <br/><br/> PV= (alto x largo x ancho)/5000 <div style='text-align: center'><img style='width: 200px' src='common/images/pv.png' /></div>",{close:"Cerrar"});
    }

    home.addPackage = function(){
      home.shipping.packages.push({
        weight: null,
        width: null,
        length: null,
        height: null
      })
    }

    home.addDocuments = function(){
      home.documents.push({
        weight: "1",
        width: "30",
        length: "20",
        height: "1"
      })
    }

    home.removePackage = function(index){
      home.shipping.packages.splice(index,1)
    }

    home.removeDocument = function(index){
      home.documents.splice(index,1)
    }
    /*nuevo diseño*/

    home.setService = function(service){

      home.shipping.from.data.country = home.shipping.from.country;
      home.shipping.to.data.country = home.shipping.to.country;

      var shipping ={
        packagingType: home.shipping.type,
        service     : service,
        from        : home.shipping.from.data,
        to          : home.shipping.to.data,
        packages    : home.shipping.packages
      }
      shell.setShipping(shipping);
      $state.go('checkout');
    }

    home.fromSearch  = null;
    home.toSearch  = null;

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

    var menu = $('#menu').innerHeight();

    home.openSection = function(index){
      var section = '.benefits-'+index;
      $(section).slideDown(300,function(){
        var topContent = $(section).offset().top;
        $('html').animate({scrollTop:topContent},500);
      });

    }

    home.cleanSearch = function(type){
      if(home.shipping[type].data){
        home.shipping[type].data =  null;
        home.shipping[type].search = null;
        if(type == 'from')
          home.fromSearch =  null;
        else  
          home.toSearch =  null;
      }
    }

    $scope.$watch('home.shipping.to.country',function(newVal, prevVal){
      if(prevVal != newVal){
        if(newVal && newVal.code){
          // home.shipping.to.search = null;
          // loadCities(newVal.code,'toCities');
        }
      }
    });

    home.closeSection = function(index){
      $('.benefits-'+index).slideUp(500);
    };

    home.createInvoice = function(){
      rateApi.createInvoice();
    }


    function getRates(fromCountry, toCountry){
      home.services = [];
      if(!fromCountry)
        fromCountry = home.shipping.from.country.code;
      if(!toCountry)
        toCountry = home.shipping.to.country.code;


      home.international =  shell.isInternational(fromCountry, toCountry);
      home.rated =  true;
      home.searching =  true;
      var topContent = $('#float-section').position().top;
      $('html').animate({scrollTop:topContent},1000);

      home.documentOpen = false;
      home.packageOpen = false;
      
      var services = [{code:"ups", international:true},{code:"fedex",international:true},{code:"redpack",international:false}];

      var fromZip;
      if(home.shipping.from.data && home.shipping.from.data.zip){
        fromZip =  home.shipping.from.data.zip;
        home.shipping.from.zip = home.shipping.from.data.zip;
      }else{
        fromZip =  home.shipping.from.zip;
        home.shipping.from.data.zip = home.shipping.from.zip;
      }

      var toZip;
      if(home.shipping.to.data && home.shipping.to.data.zip){
        toZip =  home.shipping.to.data.zip;
        home.shipping.to.zip = home.shipping.to.data.zip;
      }else{
        toZip =  home.shipping.to.zip;
        home.shipping.to.data.zip = home.shipping.to.zip;
      }

      var fromStateCode = false;
      
      if(home.shipping.from.data && home.shipping.from.data.stateCode){
        fromStateCode =  home.shipping.from.data.stateCode;
      }

      var toStateCode = false;
      if(home.shipping.to.data && home.shipping.to.data.stateCode){
        toStateCode =  home.shipping.to.data.stateCode;
      }

      var rate = {
        "type":home.shipping.type,
        "from": {
          "zip": fromZip,
          "country": fromCountry,
          "stateCode": fromStateCode
        },
        "to": {
          "zip": toZip,
          "country": toCountry,
          "stateCode": toStateCode
        },
        "packages": home.shipping.packages
      };

      console.log('rate',rate);

      var promises = [];
      angular.forEach(services,function(service){

        var runRate = true; 
        if(home.international && !service.international){
          // console.log('service no international'+service.code);
          runRate = false;
        }


        if(runRate){
          var params = {
            "type":service.code,
            "rate": rate
          };

          home.fastest = {
            time: 1000,
            code: false
          };

          home.cheapest = {
            amount: 1000000,
            code: false
          };

          // console.log('params',params);

          promises.push(

            rateApi.rate(service,params).then(function(response){
              // console.log(response);
              if(response.services){

                for(var i= 0; i< response.services.length; i++){
                  var deliveryHours =  response.services[i].deliveryHours;

                  var discountTotal =  response.services[i].discountTotal;

                  if(home.fastest.time > deliveryHours){
                    home.fastest.time = deliveryHours;
                    home.fastest.code = response.services[i].code;
                  }

                  if(home.cheapest.amount > discountTotal){
                    home.cheapest.amount = discountTotal;
                    home.cheapest.code = response.services[i].code;
                  }

                  if(deliveryHours){
                    // if(deliveryHours < 24){
                      // response.services[i].qty = deliveryHours;
                      // response.services[i].units = "HORAS";
                    // }
                    if(deliveryHours  <=24){
                      response.services[i].qty = 1;
                      response.services[i].units = "DÍA";
                    }else{
                      deliveryHours =  Math.ceil(deliveryHours/24)
                      response.services[i].qty = deliveryHours;
                      response.services[i].units = "DÍAS";
                    }
                  }else{
                    if(response.services[i].code == "08" || response.services[i].code == "11"){
                      response.services[i].qty = 5;
                      response.services[i].units = "DÍAS";
                    }
                  }


                }

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

    home.send = function(){
      if(home.shippingForm.fromZip.$valid){
        if(home.shippingForm.toZip.$valid){
          if(home.shipping.type == 'package' || home.shipping.type == 'document'){
            // if(!home.shipping.insurance || (home.shipping.insurance && home.shipping.valueDeclared && home.shipping.valueDeclared > 0)){
              if(home.shippingForm.$valid){

                if(home.shipping.type == "document"){
                  home.shipping.packages = home.documents;
                }

                var shipping = JSON.stringify(home.shipping);

                var fromCountry = home.shipping.from.country;
                var toCountry = home.shipping.to.country;

                if(fromCountry.listed == true && !home.shipping.from.data.state){
                  Dialog.showError('Selecciona un valor de origen de la lista que se despliega al escribir tu código postal o colonia.','Selecciona el origen.'); 
                }else if(toCountry.listed == true && !home.shipping.to.data.state){
                  Dialog.showError('Selecciona un valor de destino de la lista que se despliega al escribir tu código postal o colonia.','Selecciona el destino.'); 
                }
                else{
                  getRates();
                  $state.go('home', {shipping: shipping}, {notify: false});
                }
              }else{
                Dialog.showError('Verifica las dimensiones de los paquetes, recuerda que deben ser numéricos mayores a 0','Dimensiones de los paquetes');  
              }
            // }else{
              // Dialog.showError('El valor declarado debe ser mayor a 0 si deseas asegurar.','¿Cuál es el valor declarado?');
            // }
          }else{
            // alert('Selecciona si tu envio son documentos o paquetes.');
            Dialog.showError('Selecciona si tu envío son documentos o paquetes.','¿Qué envías?');
          }
        }else{
         Dialog.showError('Código postal de destino es requerido.','¿Hacia dónde envías?'); 
        }
      }else{
       Dialog.showError('Código postal de origen es requerido.','¿De dónde envías?');
      }
    };


    if($state.params){
      if($state.params.shipping){
        home.shipping = JSON.parse($state.params.shipping);
        getRates();
      }
        
    }

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
        /*parallax*/
        // $('#float-section').css({top:-(distance)});
        // $('#menu').css({'position':'absolute',top:-(menu)});
        // $('#float-section').innerHeight($('#float-section').innerHeight()-distance);
        // var menuTop = $('#menu').offset().top;
        /*parallax*/

        // if(menuTop-scroll <= 0){
        //   $('#menu').css({position:'fixed',top:0});
        //   if(!home.active)
        //     setHomeState(true);

        // }else{
        //   $('#menu').css({'position':'absolute',top:-(menu)});
        // }
        
      }else{
        if(scroll <= body ){
          setHomeState(false);
          // $('#menu').css({'position':'fixed', top:"auto"});
        }
      }

      /* section animation */
      // console.log($('.section-1').position().top);
      if(index <= home.sections.length){
        // console.log($('.section-'+index).position());
        if($('.section-'+index).position()){
          // var sectionDistance = scroll+(distance-viewport);
          // console.log('sectionDistance',sectionDistance);
          // console.log('scroll',scroll);
          // console.log('section',$('.section-'+index).offset().top);
          if( scroll+200 >= $('.section-'+index).offset().top ){
            $('.image-'+index).addClass('active')
            index++;
          }
        }
      }
    
    });
  };
})();