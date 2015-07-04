var controllers = angular.module('controllers', []);

controllers.controller('Application', ['$scope', 'socket',  function($scope, socket) {
  $scope.controller = {
    status: {
      charging: false,
      battery: null
    }
  };
  
  $scope.drone = {
    battery: null,
    speed: null
  };
  
  $scope.gauntlet = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    up: 0,
    down: 0,
    rLeft: 0,
    rRight: 0
  };
  
  socket.on('controller', function(data) {
    for (var key in data) {
      $scope.controller[key] = data[key];
    }
  });
  
  socket.on('drone', function(data) {
    for (var key in data) {
      $scope.drone[key] = data[key];
    }
  });
  
  socket.on('gauntlet', function(data) {
    for (var key in data) {
      $scope.gauntlet[key] = data[key];
    }
  });
  
}]);