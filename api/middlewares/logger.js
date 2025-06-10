var winston = require('winston');
var fs = require('fs');
var logDir = 'log';
var moment = require('moment-timezone');
var date = moment(new Date()).format("YYYYMMDD");
var logfile = 'log/results' + date + '.log';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
if (!fs.existsSync(logfile)) {
  fs.writeFile(logfile, 'Api log files created', function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });
}
var tsFormat = () => moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
var logger = new (winston.Logger)({
  transports: [
    // colorize the output to the console
    new (winston.transports.Console)({
      timestamp: tsFormat,
      colorize: true,
      json: false
    }),
    new (winston.transports.File)({
      filename: `${logfile}`,
      timestamp: tsFormat,
      json: false
    })
  ]
});

module.exports = logger;
