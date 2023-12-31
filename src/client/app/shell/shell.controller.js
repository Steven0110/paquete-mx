(function() {
  'use strict';

  angular
    .module('app.core')
    .controller('Shell',Shell);

  Shell.$inject = ['$transitions','$scope','$state','$window','$q','$timeout','template','$mdToast','userApi','shippingApi','parseheaders'];


  function Shell($transitions, $scope, $state, $window, $q, $timeout,template, $mdToast, userApi, shippingApi, parseheaders){
    // jshint validthis: true 
    var shell = this;
    shell.loading = false;
    shell.loaded = false;
    shell.labels = false;
    shell.countries = [];
    shell.shipping = false;
    shell.currentUser = false;
    shell.menuOpen = false;
    shell.dashboard ={
      title: "Title",
      subtitle: "Subtitle",
      menu: false
    }

    shell.download = function(uuid, type){
      return parseheaders.apiEndpoint.downloadInvoice+"?uuid="+uuid+"&type="+type;
    }

    shell.downloadLabel = function(trackingNumber){
      return parseheaders.apiEndpoint.downloadLabel+trackingNumber;
    }


    shell.dashMenu = [
      {name:'shippings',label:"MIS ENVIOS",uiref:"dashboard.shippings",icon:"fa-truck"},
      {name:'payments',label:"MIS PAGOS", uiref:"dashboard.payment",icon:"fa-usd"},
      // {name:'contacts',label:"MI AGENDA",uiref:"dashboard.address",icon:"fa-address-book"},
      {name:'contacts',label:"MIS TARJETAS",uiref:"dashboard.paymentMethod",icon:"fa-credit-card"},
      {name:'account',label:"MI CUENTA",uiref:"dashboard.account",icon:"fa-truck"}
    ];

    
    function setName(){
      if(shell.currentUser.name){
        shell.setName = shell.currentUser.name;
        var name =  shell.currentUser.name.split(' ');
        if(name[0])
          shell.setName = name[0];
      }
    }

    function setMenu(){
      shell.dashMenu = [
        {name:'shippings',label:"MIS ENVIOS",uiref:"dashboard.shippings",icon:"fa-truck"},
        {name:'payments',label:"MIS PAGOS", uiref:"dashboard.payment",icon:"fa-usd"},
        // {name:'contacts',label:"MI AGENDA",uiref:"dashboard.address",icon:"fa-address-book"},
        {name:'contacts',label:"MIS TARJETAS",uiref:"dashboard.paymentMethod",icon:"fa-credit-card"},
        {name:'account',label:"MI CUENTA",uiref:"dashboard.account",icon:"fa-truck"}
      ];
      if(shell.currentUser && shell.currentUser.accountType == "enterprise"){
        shell.dashMenu.push({name:'enterprise',label:"EMPRESARIAL",uiref:"dashboard.enterprise",icon:"fa-building"});
      }
    }

    function loginSuccess(){
      var currentUser = userApi.currentUser();
      shell.currentUser = currentUser; 
      setName();
      setMenu();
    }

    loginSuccess();

    shell.loginSuccess =function(){
      loginSuccess();
    }

    shell.setMenu =function(){
      setName();
      setMenu();
    }

    shell.regex = {
      zip       : /^\d{5}$/,
      mobile    : /^\d{10}$/,
      decimal   : /^\d+(\.\d{1,2})?$/,
      integer   : /^\d+$/
    }

    template.get('app/lang/es.json').then(function(labels){
      shell.labels = labels;
      template.get('app/countries/countries.json').then(function(countries){
        shell.countries = countries;
        shell.countries2 = [{"name": "méxico", "code": "mx", "listed":true}];
        shell.setLoaded(true);
      },function(err){
        console.log(err);
      });
    },function(err){
      console.log(err);
    });

    shell.showLoading = function(){
      shell.loading = true;
    };

    shell.hideLoading = function(){
      shell.loading = false;
    };

    shell.setLoaded = function(status){
      shell.loaded = status;
    }

    shell.moveToTop = function(delay){
      // if(delay)
        $('html,body').animate({scrollTop:0},500);
      // else
        // $window.scrollTo(0, 0);          
    }

    shell.showMessage = function(message){
      if(!message)
        message = "Actualización Exitosa.";
      showToast(message);
    }

    shell.showError = function(message){
      if(!message)
        message = "Hubo un error, recarga la página";
      showToast(message);
    }


    shell.setShipping = function(shipping){
      shippingApi.setShipping(shipping);
    }

    shell.getShipping = function(){
      return shippingApi.getShipping();
    }

    shell.setCurrentUser = function(user){
      userApi.setCurrentUser(user);
    };

    shell.getCurrentUser = function(){
      return userApi.currentUser();
    }

    shell.updateCurrentUser = function(){
      var deferred = $q.defer();
      userApi.getCurrentUser().then(function(user){
        shell.currentUser = user;
        userApi.setCurrentUser(user);
        deferred.resolve(user);
      },function(error){
        shell.setError(error);
        deferred.reject(error);
      });
      return deferred.promise;
    };

    shell.logout = function(){
      userApi.logout();
      shell.currentUser = null;
      $state.go('home');
    };

    shell.insert = function(array,item){
      array.splice(0,0,item);
      return array;
    }

    shell.isInternational = function(fromCountry, toCountry){
      if(fromCountry == "mx" && toCountry == "mx")
        return false;    
      else
        return true;
    }

    shell.noSession = function(){
      shell.logout();
    }

    shell.setTitle = function(title, subtitle){
      if(title){
        shell.dashboard.title = title;
      }

      if(subtitle){
        shell.dashboard.subtitle = subtitle;
      }
    }

    shell.toggleMenu = function(){
      shell.dashboard.menu = !shell.dashboard.menu;
    }


    function showToast(message){
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position('bottom right')
          .hideDelay(3000)
      );
    }

    //verificar
    shell.menu = 'shippings';
    shell.submenu = 'shippings';

    shell.setMenu =function(menu, submenu){
      if(menu)
        shell.menu = menu;
      if(submenu)
        shell.submenu = submenu;
    }
    $transitions.onStart({}, function($transitions){
      // alert();
      // $('html').offset().top =0;
      // $(window).scrollTop(0);
      // $(document).scrollTop(0);
      // alert();
      shell.menuOpen = false;
      shell.showLoading();
    });

    $transitions.onFinish({}, function($transitions){
      // alert();
      $timeout(shell.hideLoading,1000);

    });

    $transitions.onSuccess({}, function($transitions){
      // shell.hideLoading();
      
      
      var newToState = $transitions.$to();
      
      var menu = null;
      var submenu = null;

      if(newToState.data){
        if(newToState.data.menu){
          menu = newToState.data.menu
        }
        if(newToState.data.submenu){
          submenu = newToState.data.submenu
        }
        if(newToState.data.title && newToState.data.subtitle){
          shell.setTitle(newToState.data.title, newToState.data.subtitle);
        }

        shell.setMenu(menu, submenu);
      }
    });

  };
})();