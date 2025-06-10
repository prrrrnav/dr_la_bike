const logger = require("../middlewares/logger");
const db = require("../helper/database");
const { sendResponseInJson } = require("../utils/utils");
const moment = require("moment-timezone");
const common = require("../controllers/common");
const config = require("../config/config");
var smsServer = require("../helper/sendSMS");
const sgMail = require("../helper/sendemail");
const btoa = require("btoa");
const request = require("request");
const crypto = require("crypto");

/**
 * @swagger
 * /user/createRole:
 *   post:
 *     tags:
 *       - user
 *     description: create admin portal role
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: create admin portal role
 *         schema:
 *           type: object
 *           properties:
 *             role:
 *               type: string
 *             status:
 *               type: integer // 1 or 2
 *     responses:
 *       201:
 *         description: Create New Role Successfully
 *       409:
 *         description: already exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 *     securityDefinitions:
 *       petstore_auth:
 *         type: "oauth2"
 *         authorizationUrl: "http://localhost:3001/oauth/dialog"
 *         flow: "implicit"
 *         scopes:
 *           write:pets: "modify pets in your account"
 *           read:pets: "read your pets"
 *       api_key:
 *         type: "apiKey"
 *         name: "api_key"
 *         in: "header"
 */
module.exports.createRoleController = async function (req, res) {
  logger.info("Create Role", __fileName + ":" + __line);
  try {
    const roleExist = await db.execQuery(
      "SELECT * FROM module_assign WHERE role = '" + req.body.role + "'"
    );
    if (roleExist.length > 0) {
      return res.status(200).json({
        status_code: 409,
        status_message: "Role already Exist. Please try again",
      });
    } else {
      req.body.status = req.body.status == 1 ? 1 : 0;
      const params = {
        role: req.body.role,
        status: req.body.status,
      };
      const createRole = await db.inputQuery(
        "INSERT INTO module_assign SET ?",
        params
      );
      // if (createRole) {
      //   return res.status(200).json({ "status_code": 201, "status_message": "Create New Role Successfully", result: params });
      // } else {
      //   return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
      // }
      if (!createRole) {
        return sendResponseInJson(res, 500, "Internal Server Error");
      }
      params.id = createRole.insertId;
      return sendResponseInJson(
        res,
        201,
        "Create New Role successfully",
        params
      );
    }
  } catch (err) {
    logger.error("create Role -Error :-", err, ":", __fileName + ":" + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
};

function deleteUndefined(obj) {
  const newObj = Object.assign({}, obj);
  Object.keys(newObj).forEach((key) => {
    if (newObj.hasOwnProperty(key)) {
      if (newObj[key] === undefined || newObj[key] === null) {
        delete newObj[key];
      }
    }
  });
  return newObj;
}

/**
 * @swagger
 * /user/updateRole/:id:
 *   put:
 *     tags:
 *       - user
 *     description: update admin portal role permission
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update admin portal role permission
 *         schema:
 *           type: object
 *           properties:
 *             module_id:
 *               type: string // comma seprated string
 *     responses:
 *       200:
 *         description: Update Role Permission Successfully
 *
 */
module.exports.updateRoleController = async function (req, res) {
  logger.info("Update Role Permission", __fileName + ":" + __line);
  try {
    const { module_id, status } = req.body;

    const omitUndefined = function (obj) {
      const newObj = Object.assign({}, obj);
      Object.keys(newObj).forEach((key) => {
        if (newObj.hasOwnProperty(key)) {
          if (newObj[key] === undefined || newObj[key] === null) {
            delete newObj[key];
          }
        }
      });
      return newObj;
    };

    const params = omitUndefined({ module_id, status });

    const updatePermission = await db.inputQuery(
      "UPDATE module_assign SET ? WHERE module_assign_id ='" +
        req.params.id +
        "'",
      params
    );

    if (!updatePermission.affectedRows > 0) {
      return sendResponseInJson(res, 500, "Internal Server Error");
    }
    return sendResponseInJson(res, 200, "Update Role Successfully", params);
  } catch (err) {
    logger.error("Update Role -Error :-", err, ":", __fileName + ":" + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
};

/**
 * @swagger
 * /user/sendOtp:
 *   post:
 *     tags:
 *       - user
 *     description: send otp by email type 1,by phone type 2, email and phone both type 3
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: send an otp code.
 *         schema:
 *           type: object
 *           required:
 *             - otp
 *           properties:
 *             country_code:
 *               type: string
 *             phone:
 *               type: string
 *             email:
 *               type: string
 *             module:
 *               type: string
 *             type:
 *               type: string
 *             language:
 *               type: string
 *     responses:
 *       200:
 *         description: Otp send successfully on email/phone
 *       400:
 *         description: Bad request
 */

module.exports.sendOtpController = async function (req, res) {
  const { type, email, phone, module, language, country_code } = req.body;

  const expireMinutes = 5;
  let ipAddress =
    (
      req.headers["X-Forwarded-For"] ||
      req.headers["x-forwarded-for"] ||
      ""
    ).split(",")[0] || req.client.remoteAddress;
  const curDate = moment().format("YYYY-MM-DD HH:mm:ss");
  const expiredTime = moment(curDate)
    .add(expireMinutes, "minutes")
    .format("YYYY-MM-DD HH:mm:ss");
  const generatedOTP = Math.floor(Math.random() * 900000) + 100000;
  const insertOtp = {
    expiry_timestamp: expiredTime,
    module,
    otp: generatedOTP,
    ip_address: ipAddress,
  };
  let msg;
  let sendEmail;
  let insertOtpEmail;
  let emailTitle = "Verification Code";
  let emailLocale = "en";
  let messageTxt = `Your verification code for sign up/sign in with Dr. LaBike is  ${generatedOTP}. This will expire in 5 Minutes.`;
  console.log("messageTxt", messageTxt);
  try {
    if (language === "es") {
      emailTitle = "Tu c贸digo de ingreso Dr. LaBike";
      messageTxt = `Tu c贸digo de ingreso a Dr. LaBike es: ${generatedOTP}.
Expira en 5 minutos.`;
      emailLocale = "es";
    }
    console.log("test");
    // Sending otp to email
    if (type == 1 || type == 3) {
      msg = {
        from: "Dr. LaBike <" + config.sendgrid.sendgridemail + ">",
        to: email,
        subject: emailTitle,
        html: common.sendOtpTemplate(module, generatedOTP, emailLocale),
      };
      sendEmail = await sgMail.send(msg);
      if (sendEmail[0].statusCode != 202) {
        return sendResponseInJson(res, 500, "Internal Server Error");
      }
      insertOtp.email = email;
      const insertOtpEmail = await db.inputQuery(
        "INSERT INTO verification_codes SET ?",
        insertOtp
      );
      if (!insertOtpEmail) {
        return sendResponseInJson(res, 500, "Internal Server Error");
      }
      return sendResponseInJson(
        res,
        200,
        "Verification code send successfully"
      );
    }
    // Sending otp to phone
    if (type == 2 || type == 3) {
      console.log("type", type);
      // const options = {
      //   method: 'POST',
      //   url: 'https://api.labsmobile.com/json/send',
      //   headers: {
      //     'Cache-Control': 'no-cache',
      //     Authorization: 'Basic ' + btoa("bernardoaltamirano@grupomh.mx:Imperia_7220041007721"),
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     message: messageTxt,
      //     tpoa: 'Sender',
      //     recipient: [{ msisdn: '91' + phone }]
      //   })
      // };
      // request(options, async function (error, response, body) {
      //   if (error) {
      //     return sendResponseInJson(res, 500, "Internal Server Error");
      //   }
      //   insertOtp.phone = phone;
      //   const insertOtpPhone = await db.inputQuery('INSERT INTO verification_codes SET ?', insertOtp);
      //   if (!insertOtpPhone) {
      //     return sendResponseInJson(res, 500, "Internal Server Error");
      //   }
      //   return sendResponseInJson(res, 200, "Verification code send successfully");
      // });
      console.log("sms Server", {
        to: "+91" + req.body.phone,
        from: config.twilio.smsFrom,
        body: messageTxt,
      });
      console.log("smsServer", smsServer);
      console.log("process-ENV", process.env);
      smsServer.messages.create(
        {
          to: "+91" + req.body.phone,
          from: config.twilio.smsFrom,
          body: messageTxt,
        },
        async function (err, message) {
          console.log(message);
          console.log("err", err);
          // if (err) {
          // 	return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
          // }
          // insertOtp.phone = req.body.phone;
          // var insertOtpPhone = await db.inupquery('INSERT INTO verification_codes SET ?', insertOtp);
          // if (insertOtpPhone) {
          // 	res.status(200).json({ "status_code": 200, "status_message": "Verification code send successfully" });
          // } else {
          // 	res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
          // }
          if (err) {
            return sendResponseInJson(res, 500, "Internal Server Error");
          }
          insertOtp.phone = phone;
          const insertOtpPhone = await db.inputQuery(
            "INSERT INTO verification_codes SET ?",
            insertOtp
          );
          if (!insertOtpPhone) {
            return sendResponseInJson(res, 500, "Internal Server Error");
          }
          return sendResponseInJson(
            res,
            200,
            "Verification code send successfully"
          );
        }
      );
    }
  } catch (err) {
    logger.error("send otp -Error :-", err, ":", __fileName + ":" + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
};
/**
 * @swagger
 * /user/verifyOtp/:emailPhone/:otp:
 *   get:
 *     tags:
 *       - user
 *     description: verify one time password (otp)
 *     produces:
 *       - application/x-www-form-urlencoded
 *     responses:
 *       200:
 *         description: Successfully verified
 *       406:
 *         description: wrong otp
 */
module.exports.verifyOtpController = async function (req, res) {
  try {
    const curDate = moment();
    const otpExist = await db.execQuery(
      "SELECT users.users_id, verification_codes.verification_id,verification_codes.otp,verification_codes.expiry_timestamp,verification_codes.created_at FROM verification_codes LEFT JOIN users ON verification_codes.email = users.email WHERE verification_codes.email = '" +
        req.params.emailPhone +
        "' OR verification_codes.phone = '" +
        req.params.emailPhone +
        "' ORDER BY verification_id DESC"
    );
    // if (req.params.emailPhone.toLowerCase() == "bhuvi@sisgain.ae") {
    //   return sendResponseInJson(res, 200, "Otp successfully verified");
    // }
    if (otpExist.length > 0) {
      if (
        curDate >= otpExist[0].created_at &&
        curDate <= otpExist[0].expiry_timestamp &&
        otpExist[0].otp == req.params.otp
      ) {
        await db.execQuery(
          "DELETE FROM verification_codes WHERE verification_id=" +
            otpExist[0].verification_id
        );
        return sendResponseInJson(res, 200, "OTP verified successfully.", {
          userId: otpExist[0].users_id,
        });
      } else {
        // console.log(curDate >= otpExist[0].created_at, curDate <= otpExist[0].expiry_timestamp, otpExist[0].otp == req.params.otp)
        return sendResponseInJson(
          res,
          406,
          'OTP you entered is not valid. Please re-check the OTP or select "Resend" to send a new OTP.'
        );
      }
    } else {
      return sendResponseInJson(
        res,
        404,
        'OTP you entered is not valid. Please re-check the OTP or select "Resend" to send a new OTP.'
      );
    }
  } catch (err) {
    logger.error("verify  otp -Error :-", err, ":", __fileName + ":" + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
};

/**
 * @swagger
 * /user/checkExistUser/:emailPhone/:type:
 *   get:
 *     tags:
 *       - user
 *     description: check exist user for patient and doctor
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: successfully check user exist
 *       404:
 *         description: successfully check user does not exist
 *       400:
 *         description: Bad request
 */
module.exports.checkExistUserController = async function (req, res) {
  try {
    // if (!req.params.emailPhone || req.params.emailPhone.trim() == '') {
    //   logger.error(pathName, 'checkExistUser  mandatory field Email/phone is required :', __line);
    //   return res.status(200).json({ "status_code": 400, "status_message": "Email/phone is missing." });
    // }
    // if (!req.params.type || req.params.type.trim() == '') {
    //   logger.error(pathName, 'checkExistUser  mandatory field type is required :', __line);
    //   return res.status(200).json({ "status_code": 400, "status_message": "User type is missing." });
    // }
    const { emailPhone, type } = req.params;
    const dbRecords = await db.execQuery(
      "SELECT module_assign_id FROM module_assign WHERE role = '" + type + "'"
    );
    if (dbRecords.length <= 0) {
      logger.error("check user exist:", __fileName + ":" + __line);
      return sendResponseInJson(res, 400, "Invalid user type pass.");
    }
    const existUser = await db.execQuery(
      "SELECT * FROM users WHERE ( email = '" +
        emailPhone +
        "' OR phone = '" +
        emailPhone +
        "') AND user_type_id = " +
        dbRecords[0].module_assign_id
    );
    if (existUser.length > 0) {
      logger.error("User already exist:", __fileName + ":" + __line);
      return sendResponseInJson(res, 200, "This Email/phone already exist.");
    } else {
      return sendResponseInJson(
        res,
        404,
        "Sorry! You are not registered please contact your administration"
      );
    }
  } catch (err) {
    // in case of error or exception
    logger.error("create vet -Error :-", err, ":", __fileName + ":" + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
};

/**
 * @swagger
 * /user/patientSignIn:
 *   post:
 *     tags:
 *       - user
 *     description: user signIn as a patient
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: body
 *         description:  user signIn as a patient send type like doctor/patient
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             emailPhone:
 *               type: string
 *             type:
 *               type: string
 *             device_token:
 *               type: string
 *             login_type:
 *               type: string
 *               description: Either loginViaOtp or login_type
 *             loginViaOtp:
 *               type: string
 *               description: Either loginViaOtp or login_type
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: patient signIn successfully
 *       404:
 *         description: patient doesn't exist
 */
module.exports.patientSignInController = async function (req, res) {
  let query;
  try {
    const {
      emailPhone,
      type,
      login_type,
      loginViaOtp,
      device_token,
      password,
    } = req.body;
    const isEmail = isNaN(emailPhone);
    const dbRecords = await db.execQuery(
      "SELECT module_assign_id FROM module_assign WHERE role = '" + type + "'"
    );
    if (dbRecords.length <= 0) {
      logger.error("check user type exist:", __fileName + ":" + __line);
      return sendResponseInJson(
        res,
        400,
        "Please contact administrator for creating user type."
      );
    }
    // let query;
    let err_msg =
      "This email/mobile number doesn't exist Please try again with another details.";
    // if (isEmail) {
    query = `SELECT users.*,camp_lists.camp_name,camp_lists.address as h_address,camp_lists.tele_phone,camp_lists.city as h_city,camp_lists.zip_code as h_zip_code,specialities.name as s_name FROM users LEFT join camp_lists on users.camp_id = camp_lists.camp_id LEFT join specialities on users.speciality = specialities.id WHERE ${
      isEmail ? "email" : "phone"
    } = '${emailPhone}' AND user_type_id = ${
      dbRecords[0].module_assign_id
    } AND users.parent_id = 0`;
    // } else {
    //   query = "SELECT users.*,camp_lists.camp_name,camp_lists.address as h_address,camp_lists.tele_phone,camp_lists.city as h_city,camp_lists.zip_code as h_zip_code,specialities.name as s_name FROM users LEFT join camp_lists on users.camp_id = camp_lists.camp_id LEFT join specialities on users.speciality = specialities.id WHERE phone = '" + emailPhone + "' AND user_type_id = '" + type[0].module_assign_id + "' AND users.parent_id = 0"
    // }
    if (login_type || !loginViaOtp) {
      query =
        query +
        " AND password = '" +
        crypto.createHash("md5").update(password).digest("hex") +
        "'";
      err_msg =
        "This email/mobile number and password combination doesn't exist please try again with another details.";
    }
    const existPatient = await db.execQuery(query);
    if (existPatient.length > 0) {
      await common.getJwtAuthToken(
        existPatient[0].uuid,
        async function (err, cbResult) {
          if (err) {
            return sendResponseInJson(res, 401, common.errorGenerateAuthToken);
          } else if (cbResult.status_code == 200) {
            let token;
            if (device_token) {
              token = device_token.fireBaseToken;
            } else {
              token = null;
            }
            await db.execQuery(
              "UPDATE users SET is_available =1,device_token ='" +
                token +
                "' WHERE users_id ='" +
                existPatient[0].users_id +
                "'"
            );
            existPatient[0].access_token = cbResult.data.access_token;
            existPatient[0].is_available = 1;
            return sendResponseInJson(
              res,
              200,
              "Patient sign in successfully.",
              existPatient[0]
            );
          }
        }
      );
    } else {
      return sendResponseInJson(res, 400, err_msg);
    }
  } catch (err) {
    // in case of error or exception
    logger.error("Patient sign in error :-", err, ":", __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
};

/**
 * @swagger
 * /user/generateSessionToken:
 *   get:
 *     tags:
 *       - user
 *     description: generate session token by uuid for user
 *     produces:
 *       - application/x-www-form-urlencoded
 *     responses:
 *       200:
 *         description: patient signIn successfully
 *       404:
 *         description: patient doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
module.exports.generateSessionTokenController = function (req, res) {
  try {
    common.getOpenTokCallback(function (err, opentok) {
      if (err) {
        return sendResponseInJson(res, 500, "Internal Server Error");
      }
      if (opentok.status_code == 200) {
        const data = {};
        data.session = opentok.result.session;
        data.token = opentok.result.token;
        return sendResponseInJson(
          res,
          200,
          "Opentok session token for make call",
          data
        );
      }
    });
  } catch (err) {
    logger.error("verify  otp -Error :-", err, ":", __fileName + ":" + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
};

/**
 * @swagger
 * /user/logout/:uuid:
 *   get:
 *     tags:
 *       - user
 *     description: invalidate token
 *     produces:
 *       - application/x-www-form-urlencoded
 *     responses:
 *       200:
 *         description: invalidate token successfully
 *       500:
 *         description: Internal Server Error
 */
module.exports.logOutController = async function (req, res) {
  console.log(
    "[userControllers.js || Line no. 482 ....]",
    "Coming to logout controller"
  );
  try {
    const params = {
      uuid: req.params.uuid,
      xauthtoken: req.headers["x-auth-token"],
    };
    // if (!params.uuid || params.uuid == '') {
    //   logger.error(pathName,'Logout -Error_Message -validation failed "uuid is required"    :', __line);
    //   return res.status(400).json({ 'status_code': 400, "status_message": "Invalid parameter or value passed" });
    //
    // }
    const user = await db.execQuery(
      "SELECT * FROM users WHERE uuid= '" + params.uuid + "'"
    );
    if (user.length > 0) {
      const updateToken = await db.execQuery(
        "UPDATE users SET is_available = 0,device_token = NULL WHERE uuid='" +
          params.uuid +
          "'"
      );
      console.log(updateToken);
      if (updateToken.affectedRows > 0) {
        common.removeJwtAuthToken(
          params.xauthtoken,
          function (err, callbackresult) {
            if (err) {
              // console.log(err);
              return sendResponseInJson(res, 200, "Successfully logged out");
              // return	res.status(200).json({ "status_code": 200, "status_message": "Successfully logged out" });
            } else if (callbackresult.status_code == 200) {
              return sendResponseInJson(res, 200, "Successfully logged out");
            }
          }
        );
      } else {
        return sendResponseInJson(res, 500, "Internal Server Error");
      }
    } else {
      return sendResponseInJson(res, 404, "User not found!");
    }
  } catch (err) {
    console.log(err);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
};
