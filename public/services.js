var services = angular.module('services', []);

services.factory('socket', function (socketFactory) {
  return socketFactory();
});