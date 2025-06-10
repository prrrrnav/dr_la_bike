var sgMail = require("@sendgrid/mail");
const config = require("../config/config");
// sgMail.setApiKey(config.sendgrid.sendgridApiKey);
// sgMail.setApiKey("config.sendgrid.sendgridApiKey");
sgMail.setApiKey(
  "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"
);
module.exports = sgMail;
// var email = 'notificaciones@admedic.mx';
// var password = 'neQL;G_0';
// const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport({
//     name: 'mail.admedic.mx',
//     host: 'mail.admedic.mx',
//     secure: true,
//     port: 465,
//     auth: {
//         user: 'notificaciones@admedic.mx',
//         pass: 'neQL;G_0'
//     },
//      tls: {
//       rejectUnauthorized: false,
//     },
// });
// module.exports = transporter
