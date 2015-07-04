var log = require('./log');
var HID = require('node-hid');

try {
  
  var controller = new HID.HID('Bluetooth_054c_0268_5e3c5795');

  controller.data = null;

  controller.on('data', function(data) {
    controller.data = data.toJSON().data;
  });

  controller.on('error', function(err) {
    log.c(err);
  });


  controller.get = function(type) {
    if (!controller.data) {
      return null;
    } else {
      return decode(map[type].data, controller.data[map[type].pin]);
    }
  }

} catch(ex) {}

/**
 * helpers
 */

var map = {
  'buttons': {
    pin: 3,
    data: {
      'L2': 1,
      'R2': 2,
      'L1': 4,
      'R1': 8,
      '△': 16,
      'o': 32,
      'x': 64,
      '□': 128
    }
  },
  'motion': {
    pin: 2,
    data: {
      'select': 1,
      'L3': 2,
      'R3': 4,
      'start': 8,
      '↑': 16,
      '→': 32,
      '↗': 48,
      '↓': 64,
      '↘': 96,
      '←': 128,
      '↖': 144,
      '↙': 192
    }
  },
  'status': {
    pin: 29,
    data: {
      'charging': 0,
      'charging': 2,
      'not charging': 3
    }
  },
  'battery': {
    pin: 30,
    data: {
      '0': 0,
      '20': 1,
      '40': 2,
      '60': 3,
      '80': 4,
      '100': 5,
      'charging': 238
    }
  }
};

function decode(map, value) {
  var result = [];
  var keys = Object.keys(map);
  for (var i = keys.length - 1; i >= 0; i--) {
    if (value > map[keys[i]]) {
      value -= map[keys[i]];
      result.push(keys[i]);
    } else if (value == map[keys[i]]) {
      result.push(keys[i]);
      return result;
    }
  }
  return result;
}

module.exports = controller;
