angular
.module('app')
.config(config);

config.$inject = ['$locationProvider', '$urlRouterProvider','$stateProvider','localStorageServiceProvider'];

function config($locationProvider,$urlRouterProvider, $stateProvider,localStorageServiceProvider) {

  // $locationProvider.html5Mode(true);
  localStorageServiceProvider.setPrefix('general_login');
  
  $stateProvider
    .state('home',{
      url:'/',
      templateUrl : 'app/home/home.template.html',
      controller: 'Home',
      controllerAs: 'home'

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
      
  $urlRouterProvider.otherwise('/');
}