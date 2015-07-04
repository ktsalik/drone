var colors = require('colors');

var theme = {
  success: colors.green,
  error: colors.bold.red,
  info: colors.blue,
  warning: colors.yellow
};

var getMessage = function(input) {
  var message;
  if (typeof input === 'object') {
    message = JSON.stringify(input);
  } else {
    message = input;
  }
  return message;
};

var error = function(err) {
  console.log(theme.error('%s'), getMessage(err));
};

var success = function(event) {
  console.log(theme.success('%s'), getMessage(event));
};

var info = function(event) {
  console.log(theme.info('%s'), getMessage(event));
};

var clear = function() {
  console.log('\033[2J');
};

module.exports.error = error;
module.exports.success = success;
module.exports.info = info;
module.exports.c = console.log;
module.exports.clear = clear;