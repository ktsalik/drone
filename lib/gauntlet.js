var serialport = require('serialport');
var SerialPort = require("serialport").SerialPort
var serial = new SerialPort("/dev/cu.usbmodem1421", {
  baudrate: 9600,
  parser: serialport.parsers.readline("\n")
});

var gauntlet = {
  x: null,
  y: null,
  z: null,
  xx: null,
  yy: null,
  f: null,
  get top() {
    return this.y - 330;
  },
  get bottom() {
    return 330 - this.y;
  },
  get left() {
    return 330 - this.x;
  },
  get right() {
    return this.x - 330;
  },
  get up() {
    return this.yy - 330;
  },
  get down() {
    return 330 - this.yy;
  },
  get rLeft() {
    return 330 - this.xx;
  },
  get rRight() {
    return this.xx - 330;
  },
  get flex() {
    return this.f - 700;
  },
  limitRange: function(value, limit, range) { 
    if (this.flex > 80) return 0;
    return value > limit ? (limit * 100) / limit : value * 100 / limit 
  }
}

var maxY = 0, maxYY = 0;
serial.on('open', function() {
  serial.on('data', function(data) {
    var data = data.split('\t');
    gauntlet.x = data[0];
    gauntlet.y = data[1];
    gauntlet.z = data[2];
    gauntlet.f = gauntlet.f != 1337 ? data[3] : 1337;
    gauntlet.xx = data[4];
    gauntlet.yy = data[5];
    
    if (gauntlet.f != 1337 && gauntlet.f > 780) {
      maxY = gauntlet.y > maxY ? gauntlet.y : maxY;
      maxYY = gauntlet.yy > maxYY ? gauntlet.yy : maxYY;
      if (maxY > 550 && maxYY > 550) {
        gauntlet.f = 1337;
      }
    } else maxY = maxYY = 0;
    
    // console.log(gauntlet.f);
    // console.log(maxY);
    // console.log(maxYY);
  });
});

module.exports = gauntlet;