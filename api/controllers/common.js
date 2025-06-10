const config = require("../config/config");
var common = function () {};
var moment = require("moment-timezone");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var logger = require("../middlewares/logger");
var multer = require("multer");
var db = require("../helper/database");
var gcm = require("node-gcm");
const OpenTok = require("opentok");
var fs = require("fs");
const Razorpay = require("razorpay");
// const instance =  new Razorpay({ key_id: 'rzp_test_uLVfFjNRrY9F10', key_secret: '7PkERFyh7C9zvQ0HWeWzZwq5' })
const instance = new Razorpay({
  key_id: "rzp_live_Oy2v1bYxWmHadx",
  key_secret: "o9Nq6WOchl32ri6UnyVbuOWk",
});
var checkType = null;
var opentok = new OpenTok(config.opentok.apikey, config.opentok.apisecret);
var uuidv4 = require("uuid/v4");
var {
  RtcTokenBuilder,
  RtmTokenBuilder,
  RtcRole,
  RtmRole,
} = require("agora-access-token");

var pathName = "common file";
var __line;

exports.errorGenerateAuthToken =
  "Internal Server Error In Generating Auth Token";
/* Generate random token  */
exports.randomValueBase64 = function (len) {
  return crypto
    .randomBytes(Math.ceil((len * 3) / 4))
    .toString("base64")
    .slice(0, len)
    .replace(/\+/g, "0")
    .replace(/\//g, "0");
};
// generate random room name
exports.randomRoomNumber = function () {
  return Math.floor(100000 + Math.random() * 900000);
};
exports.generateUserId = async function generateUserId() {
  const uuid = "DLB" + Math.random().toString().substr(2, 7);
  const query = `SELECT users.users_id FROM users WHERE uuid = '${uuid}'`;
  const doesExist = await db.execQuery(query);
  if (doesExist.length > 0) {
    return generateUserId();
  }
  return uuid;
};
/**
 * @description Check if the provided value is in trueSet ['true', true, 1]
 * @param str
 * @returns {boolean}
 */
exports.isTrueSet = function (str) {
  return Boolean(str && (str === "true" || str === 1 || str === true));
};
exports.isDefined = function (val) {
  return val !== undefined && val !== null;
};
/*----------------------------*/
/* remove ' from string manage string */
exports.mysql_real_escape_string = function (str) {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case '"':
      case "'":
      case "\\":
      case "%":
        return "\\" + char;
    }
  });
};
// Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
var sender = new gcm.Sender(
  "AAAAr40GCso:APA91bHkiUCS3J2TMNZIslxTxi7KisuSLdH8uylUFEVUjB9x_UgBhXzQnLXe6fcPI-PdBxa9mfUxtDfbN6i4O-SsPd8gejLB6AlcmlO4wtnJKbqE20uK9kzgEK2oQy04PqmMUEqra-do"
);
exports.sendpushnotification = function (token, msg, title, sound) {
  // Prepare a message to be sent
  var message = new gcm.Message({
    data: {
      title: title,
      icon: "",
      body: msg,
      sound: sound,
      notification: {
        title: title,
        icon: "",
        body: msg,
        sound: sound,
      },
    },
  });

  // Specify which registration IDs to deliver the message to
  var regTokens = [token];

  // Actually send the message
  sender.send(
    message,
    { registrationTokens: regTokens },
    10,
    function (err, response) {
      if (err) console.error(err);
      else console.log(response);
    }
  );
};
exports.encrypt = function (text) {
  try {
    var cipher = crypto.createCipher("aes-256-cbc", "d6F3Efeq");
    var crypted = cipher.update(text.toString(), "utf8", "hex");
    crypted += cipher.final("hex");
  } catch (err) {
    crypted = "";
  }
  return crypted;
};

exports.decrypt = function (text) {
  try {
    var decipher = crypto.createDecipher("aes-256-cbc", "d6F3Efeq");
    var dec = decipher.update(text, "hex", "utf8");
    dec += decipher.final("utf8");
  } catch (err) {
    dec = "";
  }
  return dec;
};
exports.emailValidation = function (email) {
  const emailRegexp =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return !emailRegexp.test(email);
};
exports.phoneValidation = function (inputtxt) {
  //for XX-XXXX-XXXX
  var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  //for +XX-XXXX-XXXX formate ke liye
  // var phoneno = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;
  if (inputtxt.match(phoneno)) {
    return false;
  } else {
    return true;
  }
};
exports.resetPasswordCampTemplate = (obj, lang) => {
  var html;
  if (lang.toLowerCase() == "es") {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            Reset Password
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello ${obj.name},</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Need to reset your password?</td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Use your secret code</td>
                         </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:900;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#000000">${obj.otp}</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:14px;font-weight:100;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:14px;font-weight:100;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">If you did not make this request then please ignore this email.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:14px;font-weight:100;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with password ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with password ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                        
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        
                        
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                               
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  } else {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            Reset Password
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello ${obj.name},</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:14px;font-weight:100;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#000000">Your account verification code for resetting the password is: <span style="font-weight: 900">${obj.otp}</span></td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:14px;font-weight:100;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:14px;font-weight:100;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">If you did not make this request or already done with resetting the password then kindly ignore this email.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:14px;font-weight:100;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with password ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                        
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        
                        
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                               
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  }
  return html;
};

exports.agentPrescriptionTemplate = (pdfdata, lang) => {
  var html;
  if (lang.toLowerCase() == "es") {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            e-Prescription
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello there,</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Please find attached your prescription details. Also you can able to view/download the prescription through the mobile app</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with prescription ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  } else {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            e-Prescription
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello there,</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Please find attached e-prescription for the patient <strong>${pdfdata.p_name}</strong> consulted with <strong>${pdfdata.d_name}</strong> on <strong>${pdfdata.date}</strong>.
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with prescription ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  }
  return html;
};

exports.prescriptionTemplate = (pdfdata, lang) => {
  var html;
  if (lang.toLowerCase() == "es") {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            e-Prescription
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello there,</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Please find attached your prescription details. Also you can able to view/download the prescription through the mobile app</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with prescription ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  } else {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            e-Prescription
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello there,</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Please find attached your prescription details. Also you can able to view/download the prescription through the mobile app</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with prescription ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  }
  return html;
};

exports.addDoctorTemplate = (obj, lang) => {
  var html;
  if (lang.toLowerCase() == "es") {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            Created Doctor Account
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello ${obj.name},</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Welcome to Dr. LaBike doctor panel, your account has been created to access the application. You can download the application from below link and use ${obj.email}/${obj.phone} and password ${obj.password} to access the application.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:14px;font-weight:100;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"><a href="https://google.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Click Here to download app</a></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with doctor ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                        
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        
                        
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                               
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  } else {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            Account Credentials
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello ${obj.name},</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Welcome to Dr. LaBike, your account has been succesfully created to access the <strong>${obj.role} application</strong>. <a href="https://google.com">Click Here to download the mobile app</a> and start using the below credentials to access the application features.</tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">Login via email:- <strong>${obj.email}</strong></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">or</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">Login via mobile no.:- <strong>${obj.phone}</strong></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">or</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">Login via password:- <strong>${obj.password}</strong></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:14px;font-weight:100;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"><a href="https://google.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Click Here to download app</a></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with doctor ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                        
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        
                        
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                               
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  }
  return html;
};
exports.patientCheckingNotify = (obj, lang) => {
  var html;
  if (lang.toLowerCase() == "es") {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            Patient Check-In
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello ${obj.name},</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">A patient has checked into your waiting room. Please check your appointment details and connect with patient.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with check-in? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  } else {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            Patient Check-In
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello ${obj.name},</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">A patient has checked into your waiting room. Please check your appointment details and connect with patient.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with check-in? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  }
  return html;
};
exports.scheduleAppointmentTemplate = (obj, lang) => {
  var html;
  if (lang.toLowerCase() == "es") {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            Appointment Confirmation
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello there,</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">A patient has booked an appointment for ${obj.date1} at ${obj.start_time} for telecall. Please check the appointment list to cancel or reschedule the call.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with appointment ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                        
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        
                        
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                               
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  } else {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
		  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            Appointment Confirmation
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello there,</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">A patient has booked an appointment for ${obj.date1} at ${obj.start_time} for telecall. Please check the appointment list to cancel or reschedule the call.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with appointment ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                        
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        
                        
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                               
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  }
  return html;
};
exports.cancelAppointmentTemplate = (lang, obj) => {
  var html;
  if (lang.toLowerCase() == "es") {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            Cancelled Appointment
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello there,</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Your appointment with Doctor has been canceled. If you need more information please contact support to know more about it.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with appointment ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                        
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        
                        
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                               
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  } else {
    html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            Cancelled Appointment
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello there,</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Your appointment with Doctor has been cancelled. If you need more information please contact support to know more about it.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with appointment ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                        
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        
                        
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                               
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  }
  return html;
};

exports.rescheduleAppointmentTemplate = () => {
  const html = `<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            Reschedule Appointment
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello there,</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Your appointment with Doctor has been rescheduled. If you need more information please contact support to know more about it.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:14px;font-weight:100;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with appointment ? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                        
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        
                        
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                               
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  return html;
};

exports.getJwtAuthToken = async function (uuid, callback) {
  if (!uuid) {
    logger.error(
      pathName,
      "getJwtAuthToken -Error_Code :-uuid missing :",
      __line
    );
    callback(true, {
      status_code: 400,
      status_message: "No UUID was supplied.",
    });
  } else {
    try {
      var userexist = await db.execQuery(
        "SELECT uuid FROM users WHERE uuid = '" + uuid + "'"
      );
      console.log("pankaj");
      if (userexist && userexist.length > 0) {
        console.log("pankaj 1");
        let jwtToken = jwt.sign(
          {
            iss: "Dr. LaBike",
            sub: uuid,
            iat: new Date().getTime(),
          },
          config.jwt.jwtApiSecret
        );
        let objaccess = {
          uuid: uuid,
          access_token: jwtToken,
          disabled: 0,
          //'requestor_ip_address':request.connection.remoteAddress,
          created_at: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
          last_used_at: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
        };
        var accesstoken = await db.inputQuery(
          "INSERT INTO user_access_tokens SET ?",
          objaccess
        );
        console.log("pankaj 2");
        if (accesstoken) {
          callback(null, {
            status_code: 200,
            status_message: "Token create successfully",
            data: { access_token: jwtToken },
          });
        } else {
          callback(true, {
            status_code: 404,
            status_message: "Token not created successfully.",
          });
        }
      } else {
        console.log("pankaj 3");
        callback(true, {
          status_code: 400,
          status_message: "Invalid User Info supplied.",
        });
      }
    } catch (err) {
      console.log(err);
      console.log("pankaj 4");
      callback(true, { status_code: 400, status_message: err });
    }
  }
};
exports.sendOtpTemplate = (moduletext, code, lang) => {
  var html;
  if (lang.toLowerCase() == "es") {
    html = `
<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody style="width:100%">
               <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody style="width:100%">
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            Confirm Your Email Address
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello there,</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">To start using this platform, we first need to make sure this is your email address.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Type in or copy-paste the following code in the corresponding field of your registration form.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222"><span style="border:2px solid #112a4e;padding:6px 0px;padding-left:20px;padding-right:15px;letter-spacing:6px;font-size:22px;border-radius:2px;font-weight:600">${code}</span></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with your verification? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  } else {
    html = `
<div>
<center style="min-width:55ch;width:100%;font-family: 'Alata',sans-serif;text-align:center">
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px">
          </td>
        </tr>
      </tbody>
    </table>
    <table style="Margin:0 auto;background:#fefefe;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:580px">
      <tbody>
        <tr style="padding:0;text-align:left;vertical-align:top">
          <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
            <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#fafafa">
              <tbody style="width:100%">
               <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;"><img src="https://sisgain.com/project/la_bike_api/uploads/template_logo/final%20logo2.png" alt="Dr. LaBike" style="clear:both;/* display:block; */max-width:100%;outline:0;text-decoration:none;width:auto;height: 55px;" class="CToWUd">
                  </td>
                </tr>
                <tr style="padding:0;text-align:left;vertical-align:top">   
                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
                    </td>
                </tr>
              </tbody>
            </table>
        <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
           <tbody style="width:100%">
            <tr style="padding:0;text-align:left;vertical-align:top">   
              <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word">
                         <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%;background:#112a4e;color:#ffffff">
  <tbody>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:300;height:10px;line-height:1.5;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
          <img src="https://ci4.googleusercontent.com/proxy/PHmgw37WL5R2_tRO3cz9Jg4DShL4T9Jj3h_16YqbuxwEHKKCKV5lHtuhRYzlPQpsjRVdCc5KMO9LXvkJ2tbD6SsBngP4-uobGNhEUuZZ7KoKhGS2Trs8u9RRWXGCQu48DveYzA8=s0-d-e1-ft#https://d32h9taewjxhx5.cloudfront.net/email/icons/verification-code-email-icon.png" alt="Dr. LaBike" style="clear:both;max-width:100%;outline:0;text-decoration:none;width:auto" class="CToWUd">
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:600;height:10px;line-height:2.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;text-decoration:none;color:#fff">
            Confirm Your Email Address
        </td>
    </tr>
    <tr style="padding:0;text-align:left;vertical-align:top">
      <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word">
        </td>
    </tr>
   </tbody>
 </table>
<table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
    <tbody>
      <tr style="padding:0;text-align:left;vertical-align:top">
        <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
           <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
              <tbody>
                <tr style="padding:0;text-align:left;vertical-align:top">
                  <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                    <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Hello there,</td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">To start using this platform, we first need to make sure this is your email address.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:12px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Type in or copy-paste the following code in the corresponding field of your registration form.</td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222"><span style="border:2px solid #112a4e;padding:6px 0px;padding-left:20px;padding-right:15px;letter-spacing:6px;font-size:22px;border-radius:2px;font-weight:600">${code}</span></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">Having trouble with your verification? <a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> Contact us</a></td>
                         </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                         <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.6;margin:0;padding:0;text-align:center;vertical-align:top;word-wrap:break-word;color:#222222">You can visit the website for more info  <a href="https://drlabike.in/" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank" >https://drlabike.in</a></td>
                         </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                        </tr>
                        <tr style="padding:0;text-align:left;vertical-align:top">
                          <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;border-bottom:1px solid #e2e2e2"></td>
                        </tr>
                      </tbody>
                    </table>
                   </td>
                </tr>
             </tbody>
           </table>
         </td>
       </tr>
    </tbody>
</table>
                </td>
            </tr>
        </tbody></table>
             <table style="border-collapse:collapse;border-spacing:0;display:table;padding:0;text-align:left;vertical-align:top;width:100%">
               <tbody>
                  <tr style="padding:0;text-align:left;vertical-align:top">
                    <td style="border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:left;vertical-align:top;color:rgb(0,0,0)">
                   <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                      <tbody>
                       <tr style="padding:0;text-align:left;vertical-align:top">
                         <td style="Margin:0 auto;border-collapse:collapse!important;font-size:16px;font-weight:400;line-height:1.3;margin:0 auto;padding:0;padding-bottom:16px;padding-left:30px;padding-right:30px;text-align:left;vertical-align:top;word-wrap:break-word">
                            <table style="border-collapse:collapse;border-spacing:0;padding:0;text-align:left;vertical-align:top;width:100%">
                              <tbody>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="border-collapse:collapse!important;font-size:12px;font-weight:400;line-height:1.3;margin:0px;padding:0px;text-align:center;vertical-align:top;color:rgb(120,120,120)">Have questions?
                                     Contact us at<a href="mailto:support@drlabike.com" style="color:#03a9f4;text-decoration:none" rel="noreferrer" target="_blank"> support@drlabike.com</a>   
                                </td></tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Regards,</td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                  <td style="Margin:0;border-collapse:collapse!important;font-size:16px;font-weight:400;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word"></td>
                                </tr>
                                <tr style="padding:0;text-align:left;vertical-align:top">
                                 <td style="Margin:0;border-collapse:collapse!important;font-size:13px;font-weight:600;height:10px;line-height:1.3;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word;color:#222222">Drlabike team</td>
                                </tr>
                              </tbody>
                            </table>
                         </td>
                      </tr>
                   </tbody>
               </table>
            </td>
          </tr>
        </tbody>
      </table>
            </td>
         </tr>
      </tbody>
   </table>
    <table style="Margin:0 auto;border-collapse:collapse;border-spacing:0;float:none;margin:0 auto;padding:0;text-align:center;vertical-align:top;width:100%">
        <tbody>
            <tr style="padding:0;text-align:left;vertical-align:top">
                <td style="Margin:0;border-collapse:collapse!important;color:#0a0a0a;font-size:16px;font-weight:400;line-height:16px;margin:0;padding:0;text-align:left;vertical-align:top;word-wrap:break-word" height="16px "></td>
            </tr>
        </tbody>
    </table>
    </center>
          </div>`;
  }
  return html;
};
/**
 * generateToken is used to create a token for a user
 * @param {String} sessionId
 * @param {String} sipTokenData
 */

const generateToken = (sessionId, sipTokenData = "") =>
  opentok.generateToken(sessionId, {
    role: "publisher",
    data: sipTokenData,
  });

var generateTokenFunction = function (sessionId, sipTokenData) {
  //var sipTokenData = ''
  OT.generateToken(sessionId, {
    role: "publisher",
    data: sipTokenData,
  });
};

exports.getOpenTokCallback = function (callback) {
  var opentokObj;
  var sessionId;
  var token;
  try {
    opentok.createSession(
      { mediaMode: "routed", archiveMode: "manual" },
      function (err, session) {
        if (err) {
          logger.error(
            "common file getOpenTokCallback -Error :-",
            err,
            "  :",
            __line
          );
          callback(true, { status_code: 500, result: err });
        }
        console.log(session);
        console.log(err, "err");
        sessionId = session.sessionId;
        var tokenOptions = {};
        tokenOptions.role = "publisher";
        tokenOptions.data = "username=bob";
        tokenOptions.expireTime = "5620109612";
        token = opentok.generateToken(sessionId, tokenOptions);
        opentokObj = { session: sessionId, token: token };
        callback(null, { status_code: 200, result: opentokObj });
      }
    );
  } catch (err) {
    callback(true, { status_code: 500, result: "Internal server error" });
  }
};

/**
 * @swagger
 * /upload/singlefile:
 *   post:
 *     tags:
 *       - common
 *     description: upload single  file
 *     produces:
 *       - application/
 *     parameters:
 *       - in: formData
 *         name: image
 *         description: upload a file.
 *     responses:
 *       200:
 *         description: Successfully upload
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  accessKeyId: config.aws.bucketAccessKey,
  secretAccessKey: config.aws.bucketSecretKey,
});
exports.uploadSinglefile = async function (req, res) {
  //     if (!req.file) {
  // 		return res.status(200).json({ "status_code": 400, "status_message": 'Invalid file for upload' });
  // 	}
  // 	if (!req.file.originalname) {
  // 		return res.status(200).json({ "status_code": 400, "status_message": 'Invalid file for upload' });
  // 	}
  // 	const fileType = req.file.originalname.replace(/[ _-]/g, "");
  // 	var path = 'upload/image/';
  // 	const params = {
  // 		Bucket: config.aws.bucketName,
  // 		Key: `${path}${uuidv4()}_${fileType}`,
  // 		Body: req.file.buffer,
  // 		ACL: 'public-read'
  // 	}
  // 	s3.upload(params, (error, data) => {
  // 		if (error) {
  // 			return res.status(200).json({ "status_code": 500, "status_message": error });
  // 		}
  // 		return res.status(200).json({ "status_code": 200, "status_message": "Upload file successfully", "result": data });
  // 	})
  console.log(req._body);
  logger.info("petApi uploadfile");
  var dir = "./uploads/images";
  var fileName;
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    var storage = multer.diskStorage({
      destination: function (req, file, callback) {
        callback(null, "./uploads/images");
      },
      filename: function (req, file, callback) {
        var datetimestamp = Date.now();
        fileName = datetimestamp + file.originalname;
        callback(null, fileName);
      },
    });
    var upload = multer({
      storage: storage,
      onFileUploadStart: function (file) {
        console.log(file.originalname + " is starting ...");
      },
      fileFilter: function (req, file, callback) {
        callback(null, true);
      },
    }).any("file[]", 10);
    upload(req, res, function (err) {
      if (err) {
        logger.error(pathName, "upload file -Error :-", err, ":", __line);
        return res.status(200).json({
          status_code: 500,
          status_message: "Something went wrong. Please try again",
        });
      } else if (!req.files || req.files.length <= 0) {
        return res.status(200).json({
          status_code: 400,
          status_message: "Please select an image to upload",
        });
      } else {
        return res.status(200).json({
          status_code: 200,
          status_message: "File uploaded successfully",
          result: req.files[0],
        });
      }
    });
  } catch (err) {
    logger.error(pathName, "upload file -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "internal server error" });
  }
};

/**
 * @swagger
 * /upload/multiplefile:
 *   post:
 *     tags:
 *       - common
 *     description: upload multiple  file
 *     produces:
 *       - application/
 *     parameters:
 *       - in: formData
 *         name: image
 *         description: upload multiple file.
 *     responses:
 *       200:
 *         description: All file upload Successfully
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
exports.uploadMultiplefile = function (req, res) {
  var file = req.files;
  var ResponseData = [];
  file.map((item) => {
    if (!item.originalname) {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Invalid file for upload" });
    }
    const fileType = item.originalname.replace(/[ _-]/g, "");
    var path = "upload/image/";
    const params = {
      Bucket: config.aws.bucketName,
      Key: `${path}${uuidv4()}_${fileType}`,
      Body: item.buffer,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        return res.status(200).json({ status_code: 500, status_message: err });
      } else {
        ResponseData.push(data);
        if (ResponseData.length == file.length) {
          return res.status(200).json({
            status_code: 200,
            status_message: "Files uploaded successfully",
            result: ResponseData,
          });
        }
      }
    });
  });
};
exports.checkPassword = function (inputtxt) {
  var decimal =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
  if (inputtxt.match(decimal)) {
    return false;
  } else {
    return true;
  }
};

/**
 * @swagger
 * /common/getRtcAccessToken:
 *   post:
 *     tags:
 *       - common
 *     description: access token for rtc video call
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: access token for rtc video call
 *         schema:
 *           type: object
 *           properties:
 *             channelName:
 *               type: string
 *             uid:
 *               type: string
 *     responses:
 *       200:
 *         description: successfully generate rtc access token
 *       400:
 *         description: Bad request
 */
exports.getRtcAccessToken = async function (req, res) {
  logger.info(pathName, "getRtcAccessToken1111");
  logger.info(req.body, "params");
  try {
    var appID = config.agora.agoraAppId; //config.agora.agoraAppId;
    var appCertificate = config.agora.agoraSecretId; // config.agora.agoraSecretId;
    var currentTimestamp = Math.floor(Date.now() / 1000);
    var privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
    var channelName = req.body.channelName;
    var expirationTimeInSeconds = 3600;
    var role = RtcRole.PUBLISHER;
    // use 0 if uid is not specified
    var uid = req.body.uid || 0;
    checkType = req.body.callType;
    if (!channelName) {
      return res.status(200).json({
        status_code: 400,
        status_message: "Mandatory field channel name validations failed.",
      });
    }
    logger.info(checkType, "hgfdsdfghj");
    var key = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );
    res.header("Access-Control-Allow-Origin", "*");
    return res.status(200).json({
      status_code: 200,
      status_message: "create rtc token for video call",
      result: key,
      callType: checkType,
    });
  } catch (err) {
    logger.error(pathName, "getRtcAccessToken -Error :-", err, ":", __line);
    logger.error(pathName, "getRtcAccessToken1111 -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "internal server error" });
  }
};

/**
 * @swagger
 * /common/createPaymentIntent:
 *   post:
 *     tags:
 *       - common
 *     description: payment
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: deduct payment.
 *         schema:
 *           type: object
 *           properties:
 *             amount:
 *               type: string
 *     responses:
 *       200:
 *         description: successfully payment intent
 *       400:
 *         description: Bad request
 */
exports.createPaymentIntent = async function (req, res) {
  logger.info(pathName, "createPaymentIntent ", req.body.amount);
  try {
    if (!req.body.amount || req.body.amount == "") {
      logger.error(
        pathName,
        "createPaymentIntent mandatory field is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Amount is required." });
    }
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await instance.orders.create({
      amount: req.body.amount,
      currency: "INR",
      //   receipt: "receipt#1",
      //   notes: {
      //     key1: "value3",
      //     key2: "value2"
      //   }
    });
    // paymentIntents.create({
    //       amount: req.body.amount,
    //       currency: "usd",
    //     });
    // 		res.send({
    // 			clientSecret: paymentIntent.client_secret
    // 		});
    return res.status(200).json({
      status_code: 200,
      status_message: "Payment intent created successfully",
      result: paymentIntent,
    });
  } catch (err) {
    logger.error(pathName, "createPaymentIntent -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "internal server error" });
  }
};

exports.removeJwtAuthToken = async function (access_token, callback) {
  try {
    var user = await db.execQuery(
      "SELECT * FROM user_access_tokens WHERE access_token='" +
        access_token +
        "'"
    );
    if (user.length > 0) {
      var updatetoken = await db.execQuery(
        "UPDATE user_access_tokens SET disabled = 1 WHERE access_token='" +
          access_token +
          "'"
      );
      // db.exequery(query)
      if (updatetoken) {
        callback(null, {
          status_code: 200,
          status_message: "Token rejected successfully.",
        });
      } else {
        console.log("pankajsdkas");
        logger.error("removeJwtAuthToken -Error_Code :-", __line);
        callback(true, {
          status_code: 500,
          status_message: "Internal Server Error",
        });
      }
    } else {
      console.log("pankaj");
      callback(true, {
        status_code: 401,
        status_message: "Unauthorised access_token value",
      });
    }
  } catch (err) {
    console.log("pankaj 1");
    console.log(err);
    callback(true, {
      status_code: 401,
      status_message: "Unauthorised access_token value",
    });
  }
};
/**
 * @swagger
 * /user/updateAppLanguage/:id:
 *   put:
 *     tags:
 *       - common
 *     description: update user app language
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update user app language
 *         schema:
 *           type: object
 *           properties:
 *             app_language:
 *               type: string
 *     responses:
 *       200:
 *         description: Update app language Successfully
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
exports.updateAppLanguage = async function (req, res) {
  logger.info(pathName, "update app language");
  try {
    if (!req.params.id || req.params.id == "") {
      logger.error(
        pathName,
        "update app language mandatory field role id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Id is missing for update app language.",
      });
    }

    var params = {
      app_language: req.body.app_language,
    };
    var updateAppLanguage = await db.inputQuery(
      "UPDATE users SET ? WHERE users_id ='" + req.params.id + "'",
      params
    );
    if (updateAppLanguage.affectedRows > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Updated app language Successfully",
      });
    } else {
      res
        .status(200)
        .json({ status_code: 500, status_message: "Internal Server Error" });
    }
  } catch (err) {
    logger.error(pathName, "update app language -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

// module.exports = common;
