var log = require('./log');
var express = require('express');
var server = express();
var app = require('http').Server(server);
//require('dronestream').listen(app);
var io = require('socket.io')(app);

server.use(express.static('./public'));
server.use(express.static('./bower_components'));

/**
 * routes
 */



/**
 * custom methods
 */
server.start = function(callback) {
  app.listen(3000, callback);
};

module.exports = {
  server: server,
  io: io
};