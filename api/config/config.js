require('dotenv').config();
// const path = require('path');
const env = process.env.NODE_ENV;

//Start-Development Environment Config
const prod = {
  app: {
    port: parseInt(process.env.PROD_APP_PORT) || 443
  },
  db: {
    host: process.env.PROD_DB_HOST,
    port: parseInt(process.env.PROD_DB_PORT),
    database: process.env.PROD_DB_NAME,
    username: process.env.PROD_DB_USER_NAME,
    password: process.env.PROD_DB_PASSWORD,
    dialect: process.env.PROD_DB_DIALECT,
    dialectOptions: {
      "bigNumberStrings": true
    }
  },
  jwt: {
    jwtApiSecret: process.env.PROD_JWT_AUTHKEY
  },
  sendgrid: {
    sendgridemail: process.env.PROD_SENDGRID_EMAIL,
    sendgridApiKey: process.env.PROD_SENDGRID_API_KEY,
    senderName: process.env.PROD_SENDER_NAME
  },
  twilio: {
    accountId: process.env.PROD_TWILIO_ACCOUNTID,
    authToken: process.env.PROD_TWILIO_AUTHTOKEN,
    smsFrom: process.env.PROD_SMS_FROM
  },
  opentok: {
    apikey: process.env.PROD_OPENTOK_API_KEY,
    apisecret: process.env.PROD_OPENTOK_API_SECRET,
  },
  stripe: {
    secretkey: process.env.PROD_STRIPE_SECRETKEY,
    defaultCharge: process.env.PROD_STRIPE_DEFAULT_CHARGE
  },
  aws: {
    bucketAccessKey: process.env.PROD_AWS_ACCESS_KEY,
    bucketSecretKey: process.env.PROD_AWS_SECRET_KEY,
    bucketName: process.env.PROD_AWS_BUCKET_NAME
  },
  agora: {
    agoraAppId: process.env.PROD_AGORA_APP_ID,
    agoraSecretId: process.env.PROD_AGORA_SECRET_ID,
  }
};
//End-Development Environment Config
const config = {
  prod,
  dev
};
module.exports = config[env];
console.log('config.js:- End.');
