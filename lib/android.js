var com = require('serialport');

var serialPort = new com.SerialPort('/dev/cu.Bluetooth-Incoming-Port', {
	baudrate: 9600,
	parser: com.parsers.readline('\r\n')
});

serialPort.on('open', function() {
	
});

serialPort.on('close', function() {

});

serialPort.on('data', function(command) {
	android.commands.push(command);
});

serialPort.on('error', function(err) {
  console.log(err);
});

var android = {
  commands: []
};

module.exports = android;