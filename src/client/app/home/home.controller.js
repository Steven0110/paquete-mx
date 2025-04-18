(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Home',Home);

  Home.$inject = ['$state','$scope','$q','$timeout','template','rateApi','Dialog','$window'];

  function Home($state, $scope, $q, $timeout, template, rateApi, Dialog, $window){
    // jshint validthis: true 
    var home = this;
    var shell = $scope.shell;
    var index = 1;
    home.popup = {};
    home.fromCities = {};
    home.toCities = {};
    home.countries = shell.countries;
    home.options = [];
    home.international = false;
    home.maintenance = false

    home.plugin = {
      "status": "Enviar",
      "email": ""
    };

    home.api = {
      "status": "Enviar",
      "email": ""
    };

    home.popup = {
      "status": false,
      "info": {
        "title": "Aviso",
        "paragraphs": [
          "Debido a la situación que impera ante el COVID-19, por disposiciones de los socios comerciales de Paquete.MX, están presentando algunos retrasos en las entregas. Sin embargo estamos laborando en horario normal para brindarte el mejor servicio.",
          //"¡Paquete.MX les desea Feliz Semana Santa!",
          //"Gracias"
        ],
        "footerImage": "common/images/paquete-mx.png"
      }
    };

    $scope.$watch('home.shipping.from.country',function(newVal, oldVal){
      home.shipping.from.data = {};
      home.fromSearch  = null;
    });

    $scope.$watch('home.shipping.to.country',function(newVal, oldVal){
      home.shipping.to.data = {};
      home.toSearch  = null;
    });

    $scope.$watch('home.shipping.from.data',function(newVal, oldVal){
      if(newVal && newVal.state){
        $('#toSearch').focus();
      }
        
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
    home.closePopup = function(){
      home.popup.status = false;
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
      width: "38",
      length: "24",
      height: "5"
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

    home.clone = function(index){
      let cloned = JSON.parse( JSON.stringify( home.shipping.packages[ index ] ) )
      home.shipping.packages.push({
        weight: cloned.weight,
        width: cloned.width,
        length: cloned.length,
        height: cloned.height
      })
    }

    home.removeDocument = function(index){
      home.documents.splice(index,1)
    }
    /*nuevo diseño*/

    home.setService = function(service){

      $window.gtag('event', 'search', {
        'event_category' : 'enviar',
        'event_label' : 'enviar_event'
      });
      
      rateApi.sendNotification('Enviar');


      var shipping ={
        packagingType: home.shipping.type,
        service     : service,
        from        : home.rate.from.data,
        to          : home.rate.to.data,
        packages    : home.rate.packages
      }

      switch( service.service ){
        case "ups":
          shipping.from.maxReference = 23
          shipping.to.maxReference = 23
          shipping.from.maxStreet = 20
          shipping.from.maxNumber = 7
          shipping.from.maxApt = 6
          shipping.to.maxStreet = 20
          shipping.to.maxNumber = 7
          shipping.to.maxApt = 6
          break;
        case "fedex":
          shipping.from.maxReference = 40
          shipping.to.maxReference = 40
          shipping.from.maxStreet = 20
          shipping.from.maxNumber = 7
          shipping.from.maxApt = 6
          shipping.to.maxStreet = 20
          shipping.to.maxNumber = 7
          shipping.to.maxApt = 6
          break;
        case "redpack":
          shipping.from.maxReference = 20
          shipping.to.maxReference = 20
          shipping.from.maxStreet = 40
          shipping.from.maxNumber = 10
          shipping.from.maxApt = 8
          shipping.to.maxStreet = 40
          shipping.to.maxNumber = 10
          shipping.to.maxApt = 8
          break;
      }


      shell.setShipping(shipping);
      $state.go('checkout');
    }

    home.reload = function(){      
      $state.go('home',{shipping:null},{reload:true});
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

    // var menu = $('#menu').innerHeight();

    home.openSection = function(index, timing){
      shell.menuOpen = false;
      var speed = 500;
      if(timing && timing > 500)
        speed = timing;
      var section = '.benefits-'+index;
      $(section).slideDown(300,function(){
        var topContent = $(section).offset().top;
        $('html,body').animate({scrollTop:topContent},timing);
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

    // $scope.$watch('home.shipping.to.country',function(newVal, prevVal){
    //   if(prevVal != newVal){
    //     if(newVal && newVal.code){
    //       // home.shipping.to.search = null;
    //       // loadCities(newVal.code,'toCities');
    //     }
    //   }
    // });

    home.closeSection = function(index){
      $('.benefits-'+index).slideUp(500);
    };

    home.createInvoice = function(){
      rateApi.createInvoice();
    }

    home.sendContactRequest = function(type){
      if(home[type].email){
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
          if(this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(this.responseText);
            if(response.code === "8000"){
              home[type].status = "Enviado ✔";
              $scope.$apply();
            }
          }
        };
        xhttp.open("POST", "https://r8v9vy7jw5.execute-api.us-west-2.amazonaws.com/api/contact", true);
        //xhttp.open("POST", "#", true);
        xhttp.send(JSON.stringify({"email": home[type].email, "type": type}));
      }
    }


    function getRates(fromCountry, toCountry){
      home.services = [];

      if(!fromCountry)
        fromCountry = home.shipping.from.country.code;
      if(!toCountry)
        toCountry = home.shipping.to.country.code;



      for(var i=0;i<home.shipping.packages.length; i++){
        var weight = parseFloat(home.shipping.packages[i].weight);
        var volumetric = parseFloat(home.shipping.packages[i].volumetric);
        if(weight > 70 || volumetric > 70){
          Dialog.showError('El límite de peso para envios domesticos es de 70 Kg. Si hacer envios mayores a este peso por favor contactanos en: hola@paquete.mx.','Máximo 70 Kg permitido.');
          return false;
        }
      }


      home.international =  shell.isInternational(fromCountry, toCountry);
      home.rated =  true;
      home.searching =  true;
      var topContent = $('#float-section').position().top;
      $('html, body').animate({scrollTop:topContent},1000);

      home.documentOpen = false;
      home.packageOpen = false;
      
      var services = [{code:"ups", international:true},{code:"fedex",international:true},{code:"redpack",international:false}];

      var fromZip;
      if(home.shipping.from.data && home.shipping.from.data.zip){
        fromZip =  home.shipping.from.data.zip;
        home.shipping.from.zip = home.shipping.from.data.zip;
      }else{
        fromZip =  home.fromSearch;


        if(home.shipping.from){
          if(!home.shipping.from.data){
            home.shipping.from.data = {};
          }
          home.shipping.from.data.zip = home.fromSearch;
          home.shipping.from.zip = home.fromSearch;
        }
      }

      var toZip;
      
      if(home.shipping.to.data && home.shipping.to.data.zip){
        toZip =  home.shipping.to.data.zip;
        home.shipping.to.zip = home.shipping.to.data.zip;
      }else{
        toZip =  home.toSearch;
        if(home.shipping.to){
          if(!home.shipping.to.data){
            home.shipping.to.data ={};
          }
          home.shipping.to.data.zip = home.toSearch;
          home.shipping.to.zip = home.toSearch;
        }
      }

      var fromStateCode = false;
      
      if(home.shipping.from.data && home.shipping.from.data.stateCode){
        fromStateCode =  home.shipping.from.data.stateCode;
      }

      var toStateCode = false;
      if(home.shipping.to.data && home.shipping.to.data.stateCode){
        toStateCode =  home.shipping.to.data.stateCode;
      }
      if(home.shipping.from && home.shipping.from.data  && home.shipping.from.country)
        home.shipping.from.data.country = JSON.parse(JSON.stringify(home.shipping.from.country));
      if(home.shipping.to && home.shipping.to.data && home.shipping.to.country)
        home.shipping.to.data.country = JSON.parse(JSON.stringify(home.shipping.to.country));

      home.rate = {
        "type":home.shipping.type,
        "from": {
          "data": home.shipping.from.data,
          "zip": fromZip,
          "country": fromCountry,
          "stateCode": fromStateCode
        },
        "to": {
          "data": home.shipping.to.data,
          "zip": toZip,
          "country": toCountry,
          "stateCode": toStateCode
        },
        "insurance": home.shipping.insurance,
        "insuranceAmount": home.shipping.insuranceAmount,
        "packages": home.shipping.packages
      };

      var promises = [];
      angular.forEach(services,function(service){

        var runRate = true; 
        if(home.international && !service.international){
          runRate = false;
        }


        if(runRate){
          var params = {
            "type":service.code,
            "rate": home.rate
          };

          home.fastest = {
            time: 1000,
            code: false
          };

          home.cheapest = {
            amount: 1000000,
            code: false
          };

          promises.push(

            rateApi.rate(service,params).then(function(response){
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
              // console.log(err);
              // var deferred = $q.defer();
              // deferred.reject(err);
              // return deferred.promise;


              var response = {
                services: [
                  {
                    "name": "Envío Express",
                    "deliveryHours": 72,
                    "discountTotal": 100,
                    "amount": 1000,
                    "service": "ups",
                  },
                ]
              }

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
            })
          );
        }
      });
      $q.all(promises).then(function(result){

        home.shipping.from.data = {};
        home.shipping.from.zip = null;
        home.shipping.to.data = {};
        home.shipping.to.zip = null;
        home.fromSearch  = null;
        home.toSearch  = null;

      },function(err){
        console.log(err);
      }).finally(function(){
        // console.log(home.services);
        home.searching = false;
      });
    }

    home.send = function(){
      if(home.shippingForm.fromZip.$valid){
        if(home.shippingForm.toZip.$valid){
          if(home.shipping.type == 'package' || home.shipping.type == 'document'){
            $timeout(function(){
              if(home.shippingForm.$valid){

                if(home.shipping.type == "document"){
                  home.shipping.packages = home.documents;
                }

                var fromCountry = home.shipping.from.country;
                var toCountry = home.shipping.to.country;
                if(fromCountry.listed == true && !home.shipping.from.data){
                  Dialog.showError('Selecciona un valor de origen de la lista que se despliega al escribir tu código postal o colonia.','Selecciona el origen.'); 
                }else if(toCountry.listed == true && !home.shipping.to.data){
                  Dialog.showError('Selecciona un valor de destino de la lista que se despliega al escribir tu código postal o colonia.','Selecciona el destino.'); 
                }
                else{
                  getRates();

                  var shipping = JSON.stringify(home.shipping);
                  $state.go('home', {shipping: shipping}, {notify: false});
                }
              }else{
                Dialog.showError('Verifica los valores de dimensiones y peso (deben ser mayores a 0). En caso de asegurar el envío, poner un valor válido.','Valores incorrectos');
              }
            },500);
          }else{
            Dialog.showError('Selecciona si tu envío son documentos o paquetes.','¿Qué envías?');
          }
        }else{
         Dialog.showError('Código postal de destino es requerido.','¿Hacia dónde envías?'); 
        }
      }else{
       Dialog.showError('Código postal de origen es requerido.','¿De dónde envías?');
      }
      // ga('send', 'event', 'button', 'click');
    };


    if($state.params){
      $timeout(function(){
        if($state.params.shipping){
          home.shipping = JSON.parse($state.params.shipping);
          getRates();
        }else if($state.params.section){
          var section = $state.params.section;
          var index = 0;
          if(section == 'payments')
            index = 2;
          if(section == 'eCommerce')
            index = 4;
          home.openSection(index, 1500);
        }
      },500)
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