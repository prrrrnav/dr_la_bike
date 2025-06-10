const config = require('../config/config');
// Twilio Credentials 
var accountSid = config.twilio.accountId; 
var authToken = config.twilio.authToken; 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken);
module.exports = client;
