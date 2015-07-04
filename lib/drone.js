var arDrone = require('ar-drone');
drone = arDrone.createClient();

drone.config('general:navdata_demo', 'FALSE');
drone.config('control:outdoor', 'FALSE')
drone.config('control:￼￼control:flight_without_shell', 'FALSE')
drone.config('control:altitude_min', 50)
drone.config('control:altitude_max', 100000)

drone.data = null;
drone.state = {};

drone.on('navdata', function(data) {
  drone.data = data;
  drone.state = data.droneState;
});

drone.speed = 0.2;

module.exports = drone;

drone.dancing = false;
drone.dance = function(movements, timespan, callback) {
  if (!movements.length) { drone.stop(); callback(); return; }
  drone[movements.shift()](1);
  setTimeout(function() {
    drone.dance(movements, timespan, callback);
  }, timespan);
};