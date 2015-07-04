var _ = require('lodash');
var Player = require('player');
var player = new Player('./beating.mp3'); player.on('error', function(err) { });
var log = require('./lib/log');
var ps3Controller = require('./lib/controller');
var web = require('./lib/server');
var drone = require('./lib/drone');
var gauntlet = require('./lib/gauntlet');
var android = require('./lib/android');

var server = web.server;
var io = web.io;

server.start(function() {
  log.success('server started at 3000');
});

io.on('connection', function(socket) {
  // a client connected
});

setInterval(function sendControllerStatus() {
  if (typeof ps3Controller === 'undefined') return;
  var status = ps3Controller.get('status');
  var battery = ps3Controller.get('battery');
  io.sockets.emit('controller', {
    status: {
      charging: status.indexOf('charging') > -1 ? true : false,
      battery: battery[0]
    }
  });
}, 1000);

setInterval(function sendDroneStatus() {
  io.sockets.emit('drone', {
    battery: drone.data && drone.data.demo ? drone.data.demo.batteryPercentage : null,
    speed: drone.speed,
    raw: drone.data
  });
}, 1000);

setInterval(function sendGauntletsStatus() {
  if (typeof gauntlet === 'undefined') return;
  io.sockets.emit('gauntlet', {
    top: gauntlet.limitRange(gauntlet.top, 20, 100),
    right: gauntlet.limitRange(gauntlet.right, 20, 100),
    bottom: gauntlet.limitRange(gauntlet.bottom, 20, 100),
    left: gauntlet.limitRange(gauntlet.left, 20, 100),
    up: gauntlet.limitRange(gauntlet.up, 20, 100),
    down: gauntlet.limitRange(gauntlet.down, 20, 100),
    rLeft: gauntlet.limitRange(gauntlet.rLeft, 20, 100),
    rRight: gauntlet.limitRange(gauntlet.rRight, 20, 100)
  });
}, 100);

setInterval(function processAndroid() {
  if (!drone.state.flying) return;
  if (android.commands.length > 0) {
    if (android.commands.pop() == 'shake') {
      if (!drone.dancing) {
        pauseControl = drone.dancing =  true;
        drone.stop();
        drone.dance(['left', 'right', 'left', 'right'], 350, function() { pauseControl = false; setTimeout(function() { drone.dancing = false; }, 2500); });
      }
    }
    android.commands = [];
  }
}, 100);

setInterval(function processGauntlets() {
  if (typeof gauntlet === 'undefined') return;
  
  var map = {
    top: 'front', bottom: 'back', left: 'left', right: 'right',
    up: 'down', down: 'up', rLeft: 'counterClockwise', rRight: 'clockwise'
  };
  ['top', 'left', 'right', 'bottom', 'up', 'down', 'rLeft', 'rRight'].forEach(function(action) {
    droneActions[map[action]][1] = gauntlet.limitRange(gauntlet[action], 20, 100) >= 100 ? 1 : 0;
  });
  
  if (drone.state.flying && gauntlet.f == 1337) {
    if (drone.pauseControl) return;
    drone.pauseControl = true;
    drone.stop();
    drone.animate('flipLeft', 100);
    // console.log('flip');
    player.play();
    setTimeout(function() {
      gauntlet.f = 0;
      drone.pauseControl = false;
    }, 100);
  }
}, 30);

var ctrlActions;
setInterval(function processController() {
  if (typeof ps3Controller === 'undefined') return;
    ctrlActions = Array.prototype.concat(ps3Controller.get('motion'), ps3Controller.get('buttons'));
    
  var analogs = {
    left: {
      up: 128 - ps3Controller.data[7],
      down: ps3Controller.data[7] - 128,
      left: 128 - ps3Controller.data[6],
      right: ps3Controller.data[6] - 128,
    },
    right: {
      up: 128 - ps3Controller.data[9],
      down: ps3Controller.data[9] - 128,
      left: 128 - ps3Controller.data[8],
      right: ps3Controller.data[8] - 128,
    }
  };
  
  if (analogs.left.up > 100) ctrlActions.push('↑');
  if (analogs.left.down > 100) ctrlActions.push('↓');
  if (analogs.left.left > 100) ctrlActions.push('←');
  if (analogs.left.right > 100) ctrlActions.push('→');
  if (analogs.right.up > 100) ctrlActions.push('front');
  if (analogs.right.down > 100) ctrlActions.push('back');
  if (analogs.right.left > 100) ctrlActions.push('left');
  if (analogs.right.right > 100) ctrlActions.push('right');
  
  var map = {
    x: 'front', '←': 'counterClockwise', '→': 'clockwise', '↑': 'up', '↓': 'down', L3: 'stop1', R3: 'stop2',
    front: 'front', left: 'left', right: 'right', back: 'back'
  };
  ['x', '←', '→', '↑', '↓', 'front', 'left', 'right', 'back'].forEach(function(action) {
    if (action == 'front' && droneActions.front[0] > 0) return
    droneActions[map[action]][0] = ctrlActions.indexOf(action) > -1 ? 1 : 0;
  });
  
  ctrlActions.forEach(function(action) {
    switch(action) {
      case 'L3':
      case 'R3':
        drone.animateLeds('blinkRed', 10, 0);
        drone.stop();
      break;
      case 'start':
        if (!drone.state.flying) {
          if (drone.state.lowBattery) {
            log.error('drone: LOW BATTERY');
          }
          log.info('Take off')
          drone.disableEmergency();
          drone.takeoff(function() {
            // took off
          });
        }
      break;
      case 'select':
        if (drone.state.flying) {
          drone.stop();
          drone.land(function() {
            // landed
          });
          log.info('Landing');
        }
      break;
    }
  });
}, 30);

var droneActions = {
  'front': [0, 0],
  'back': [0, 0],
  'left': [0, 0],
  'right': [0, 0],
  
  'up': [0, 0],
  'down': [0, 0],
  'counterClockwise': [0, 0],
  'clockwise': [0, 0],
};

var ref = {};
var pcmd = {};
var pauseControl = false;
setInterval(function controlDrone() {
  //console.log(drone._pcmd);
  if (pauseControl) return;
  pcmd = drone._pcmd;
  
  [
    ['front', 'back'],
    ['left', 'right'],
    ['up', 'down', 1],
    ['counterClockwise', 'clockwise', 0.7]
  ].forEach(function(actionPair) {
    if (droneActions[actionPair[0]][0] + droneActions[actionPair[0]][1] > 0) {
      drone[actionPair[0]](actionPair[2] || drone.speed);
      //pcmd[actionPair[0]] = drone.speed;
      //delete pcmd[actionPair[1]];
    } else if (droneActions[actionPair[1]][0] + droneActions[actionPair[1]][1] > 0) {
      drone[actionPair[1]](actionPair[2] || drone.speed);
      //pcmd[actionPair[1]] = drone.speed;
      //delete pcmd[actionPair[0]];
    } else {
      delete pcmd[actionPair[0]];
      delete pcmd[actionPair[1]];
    }
  });
  
  //console.log('\033[2J');
  //console.log(ctrlActions);
  //console.log(droneActions);
  //console.log(drone._ref);
  //console.log(drone._pcmd);
}, 30);