angular
.module('app')
.config(config);

config.$inject = ['$locationProvider', '$urlRouterProvider','$stateProvider','$mdThemingProvider','localStorageServiceProvider'];

function config($locationProvider,$urlRouterProvider, $stateProvider,$mdThemingProvider,localStorageServiceProvider) {

  // $locationProvider.html5Mode(true);
  localStorageServiceProvider.setPrefix('general_login');

  $mdThemingProvider.definePalette('customPalette', {
    '50': 'fef1e0',
    '100': 'fbdcb3',
    '200': 'f9c580',
    '300': 'f7ae4d',
    '400': 'f59c26',
    '500': 'f38b00',
    '600': 'f18300',
    '700': 'ef7800',
    '800': 'ed6e00',
    '900': 'ea5b00',
    'A100': 'ffffff',
    'A200': 'ffe9de',
    'A400': 'ffc6ab',
    'A700': 'ffb591',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': [
      '50',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      'A100',
      'A200',
      'A400',
      'A700'
    ],
    'contrastLightColors': [
      '900'
    ]
  });


  $mdThemingProvider.theme('default')
    .primaryPalette('customPalette');
  
  $stateProvider
    .state('home',{
      url:'/',
      templateUrl : 'app/home/home.template.html',
      controller: 'Home',
      controllerAs: 'home'

    })
    .state('checkout',{
      url:'/checkout',
      templateUrl : 'app/checkout/checkout.template.html',
      controller: 'Checkout',
      controllerAs: 'checkout'

    })
    .state('login',{
      url:'/login',
      templateUrl : 'app/login/login.template.html',
      controller: 'Login',
      controllerAs: 'login'

    })
    .state('forgot',{
      url:'/forgot-password',
      templateUrl : 'app/forgot/forgot.template.html',
      controller: 'Forgot',
      controllerAs: 'forgot'
    })
    .state('payment-method',{
      url:'/metodos-de-pago',
      templateUrl : 'app/general/paymentMethod/paymentMethod.template.html'
      // controller: 'Forgot',
      // controllerAs: 'forgot'
    })
    .state('dashboard',{
      url:'/dashboard',
      templateUrl: 'app/dashboard/dashboard.template.html',
      data:{
        access: true,
        dashboard: true
      }
    })
    .state('dashboard.start',{
      url:'/start',
      templateUrl: 'app/dashboard/start/start.template.html',
      controller: 'Start',
      controllerAs: 'start'
    })
    .state('dashboard.address',{
      url:'/address',
      templateUrl: 'app/dashboard/address/addresses.template.html',
      controller: 'Addresses',
      controllerAs: 'addresses',
      data:{
        menu: "contacts",
        submenu: "addresses"
      }
    })
    .state('dashboard.editAddress',{
      url:'/address/:objectId',
      templateUrl: 'app/dashboard/address/address.template.html',
      controller: 'Address',
      controllerAs: 'address',
      resolve:{
        data: function($stateParams, userApi){
          return userApi.getAddress($stateParams.objectId);
        }
      },
      data:{
        menu: "contacts",
        submenu: "addresses"
      }
    })
    
      
  $urlRouterProvider.otherwise('/');
}