angular
  .module('app.core')
  .directive('confirmDialog',confirmDialog);

confirmDialog.$inject = ['Message'];

function confirmDialog(){
  return{
    restrict: 'E',
    scope: true,
    templateUrl: 'app/directives/message/message.template.html',
    controller:function($scope, Message){
      $scope.showModal= false;
      $scope.question = '¿Deses ejecutar esta acción?';

      $scope.confirmModal = function(){
        Message.setValue(true);
        Message.setModal(false);
      };

      $scope.cancelModal = function(){
        Message.setValue(false);
        Message.setModal(false);
      };

      
        
      $scope.$watch(
        function() {
          return Message.showModal;
        },
        function() {
          // console.log('modal', 'Change detected, new object:', Message.showModal);
          $scope.showModal =   Message.showModal;
          // angular.copy(Message.showModal, $scope.showModal);
        },
        true // No need to be true
      );

      $scope.$watch(
        function() {
          return Message.question;
        },
        function() {
          // console.log('question', 'Change detected, new object:', Message.question);
          $scope.question =   Message.question;
          // angular.copy(Message.showModal, $scope.showModal);
        },
        true // No need to be true
      );
    }
  };
}