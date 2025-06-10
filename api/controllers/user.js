const config = require("../config/config");
var user = function () {};
var moment = require("moment-timezone");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var common = require("../controllers/common");
var sgMail = require("../helper/sendemail");
var smsServer = require("../helper/sendSMS");
var logger = require("../middlewares/logger");
var db = require("../helper/database");
const { sendResponseInJson } = require("../utils/utils");
var uuidv4 = require("uuid/v4");
var btoa = require("btoa");
var pathName = "User file";
const request = require("request");
var __line;

/**
 * @swagger
 * /user/getAllEarningReport/:page?/:limit?:
 *   get:
 *     tags:
 *       - Admin
 *     description: get doctor list with details credit amount
 *     produces:
 *       - application/x-www-form-urlencoded
 *     responses:
 *       200:
 *         description: get  list Successfully
 *       404:
 *         description:  list doesn't exist
 *       401:
 *         description: Validation error with error obj containing the key
 */
user.getAllEarningReport = async function (req, res, next) {
  //   console.log('Getting doctor list!!! from my refactored code');
  logger.info(pathName, "Earning list");
  try {
    const { limit, page, camp_id } = req.params;
    // const limit = req.params.limit || 20;
    const offset = page > 0 ? page - 1 : 0;
    const type = await db.execQuery(
      "SELECT module_assign_id FROM module_assign WHERE role = 'doctor' OR role ='representative'"
    );
    if (type.length <= 0) {
      logger.error(pathName, "Get Doctor list :", __fileName + ":" + __line);
      return sendResponseInJson(
        res,
        400,
        "Please contact administrator for creating user type."
      );
    }
    console.log("dbcsd");
    const doctor = await db.execQuery(
      "select users_id,users.first_name,users.last_name,users.credit,(select sum(amount) from credits where updated_for=users_id )as useramount from users where users.user_type_id='" +
        type[0].module_assign_id +
        "' ORDER BY users_id DESC  limit " +
        limit +
        " offset " +
        limit * offset
    );
    const clinic = await db.execQuery(
      "select users_id,users.first_name,users.last_name,users.credit,(select sum(amount) from credits where updated_for=users_id )as useramount from users where users.user_type_id='" +
        type[1].module_assign_id +
        "' ORDER BY users_id DESC  limit " +
        limit +
        " offset " +
        limit * offset
    );

    const total = await db.execQuery(
      "select (select sum(amount) from credits LEFT Join users on credits.updated_for = users.users_id AND users.user_type_id='" +
        type[1].module_assign_id +
        "' WHERE users.user_type_id='" +
        type[1].module_assign_id +
        "') as reptotal, (select sum(amount) from credits LEFT Join users on credits.updated_for = users.users_id AND users.user_type_id='" +
        type[0].module_assign_id +
        "' WHERE users.user_type_id='" +
        type[0].module_assign_id +
        "') as doctotal"
    );

    return sendResponseInJson(res, 200, "Get earning List successfully", {
      doctors: doctor,
      total: total,
      clinic: clinic,
    });
  } catch (err) {
    console.log(err);
    logger.error(
      pathName,
      "Get Doctor List -Error :-",
      err,
      ":",
      __fileName + ":" + __line
    );
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
};
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
user.createRole = async function (req, res) {
  logger.info(pathName, "Create Role");
  try {
    if (
      !req.body.role ||
      (req.body.role && req.body.role.trim() == "") ||
      !req.body.status
    ) {
      logger.error(
        pathName,
        "Create Role mandatory field role is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Role name is missing." });
    }
    if (!req.body.status) {
      logger.error(
        pathName,
        "Create Role mandatory field status is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Role status is required." });
    }
    const roleExist = await db.execQuery(
      "SELECT * FROM module_assign WHERE role = '" + req.body.role + "'"
    );
    if (roleExist.length > 0) {
      return res
        .status(200)
        .json({
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
      if (createRole) {
        params.id = createRole.insertId;
        return res
          .status(200)
          .json({
            status_code: 201,
            status_message: "Create New Role Successfully",
            result: params,
          });
      } else {
        return res
          .status(200)
          .json({ status_code: 500, status_message: "Internal Server Error" });
      }
    }
  } catch (err) {
    logger.error(pathName, "create Role -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /user/updateRolePermission/:id:
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
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
user.updateRolePermission = async function (req, res) {
  logger.info(pathName, "update Role Permission");
  try {
    if (!req.params.id || req.params.id == "") {
      logger.error(
        pathName,
        "update Role Permission mandatory field role id is required :",
        __line
      );
      return res
        .status(200)
        .json({
          status_code: 400,
          status_message: "Role id is missing for update role.",
        });
    }
    if (!req.body.module_id || req.body.module_id == "") {
      logger.error(
        pathName,
        "update Role Permission mandatory field module aid is required :",
        __line
      );
      return res
        .status(200)
        .json({
          status_code: 400,
          status_message: "Module is missing for update.",
        });
    }
    var params = {
      module_id: req.body.module_id,
    };
    var updatePermission = await db.inputQuery(
      "UPDATE module_assign SET ? WHERE id ='" + req.params.id + "'",
      params
    );
    if (updatePermission.affectedRows > 0) {
      res
        .status(200)
        .json({
          status_code: 200,
          status_message: "Update Role Permission Successfully",
        });
    } else {
      res
        .status(200)
        .json({ status_code: 500, status_message: "Internal Server Error" });
    }
  } catch (err) {
    logger.error(
      pathName,
      "update Role Permission -Error :-",
      err,
      ":",
      __line
    );
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};
/**
 * @swagger
 * /user/updateRoleStatus/:id:
 *   put:
 *     tags:
 *       - user
 *     description: update admin portal role status
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update admin portal role status
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: number // active for 1 or inactive for 2
 *     responses:
 *       200:
 *         description: Update Role Status Successfully
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
user.updateRoleStatus = async function (req, res) {
  logger.info(pathName, "update Role Status");
  try {
    if (!req.params.id || req.params.id == "") {
      logger.error(
        pathName,
        "update Role Status mandatory field role id is required :",
        __line
      );
      return res
        .status(200)
        .json({
          status_code: 400,
          status_message:
            "Role id is missing for update role active/inactive .",
        });
    }

    if (!req.body.status || req.body.status.trim() == "") {
      logger.error(
        pathName,
        "update Role Status mandatory field role status is required :",
        __line
      );
      return res
        .status(200)
        .json({
          status_code: 400,
          status_message:
            "Role status is missing for update role active/inactive .",
        });
    }
    req.body.status = req.body.status == 1 ? 1 : 0;
    var params = {
      status: req.body.status,
    };
    var updatePermission = await db.inputQuery(
      "UPDATE module_assign SET ? WHERE id ='" + req.params.id + "'",
      params
    );
    if (updatePermission.affectedRows > 0) {
      res
        .status(200)
        .json({
          status_code: 200,
          status_message: "Update Role Status Successfully",
        });
    } else {
      res
        .status(200)
        .json({ status_code: 500, status_message: "Internal Server Error" });
    }
  } catch (err) {
    logger.error(pathName, "update Role Status -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

// /**
//  * @swagger
//  * /user/adminLogin:
//  *   post:
//  *     tags:
//  *       - user
//  *     description: Get a admin login access
//  *     produces:
//  *       - application/json
//  *     parameters:
//  *       - in: body
//  *         name: body
//  *         description: admin login
//  *         schema:
//  *           type: object
//  *           properties:
//  *             email:
//  *               type: string
//  *             password:
//  *               type: string
//  *     responses:
//  *       200:
//  *         description: admin logedin Successfully.
//  */
// user.adminLogin = async function (req, res) {
// 	logger.info(pathName, 'admin Login email =', req.body.email);
// 	var errorMessage = "Sorry but we couldn't log you in. Please verify the details you entered and try again";
// 	var params = { email: req.body.email, password: req.body.password };
// 	if (!params.email || params.email == '') {
// 		logger.error(pathName, 'admin Login -Error_Message -validation failed "email is required":', __line);
// 		return res.status(200).json({ "status_code": 400, "status_message": "Please check email and try again" });
// 	}
// 	if (!params.email || params.email == '' || !params.password || params.password == '') {
// 		logger.error(pathName, 'admin Login -Error_Message -validation failed "password is required":', __line);
// 		return res.status(200).json({ "status_code": 400, "status_message": "Please check password and try again" });
// 	}
// 	if (params.password.length < 25) {
// 		params.password = crypto.createHash("md5").update(params.password).digest("hex");
// 	}
// 	try {
// 		var admin = await db.exequery("SELECT users.*,module_assign_id,role,module_id FROM users LEFT JOIN module_assign ON users.user_type_id = module_assign_id WHERE  email = '" + params.email + "' AND password = '" + params.password + "' AND is_active = 1 AND user_type_id  NOT IN (3,4)");
// 		if (admin.length > 0) {
// 			common.getJwtAuthToken(admin[0].uuid, function (err, callbackresult) {
// 				if (err) {
// 					return res.status(200).json({ "status_code": 401, "status_message": errorMessage });
// 				} else if (callbackresult.status_code == 200) {
// 					admin[0].access_token = callbackresult.data.access_token;
// 					return res.status(200).json({ "status_code": 200, "status_message": "Login successfully", "result": admin[0] });
// 				}
// 			});
// 		} else {
// 			res.status(200).json({ "status_code": 404, "status_message": "This email/password combination is not associated with an existing account.Please either try again" });
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'admin login -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }

/**
 * @swagger
 * /admin/login:
 *   post:
 *     tags:
 *       - user
 *     description: pass role in string 'doctor' or 'admin'
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: login admin
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *             type:
 *               type: string
 *     responses:
 *       200:
 *         description: Successfully loged In
 *
 */
user.adminLogin = async function (req, res) {
  logger.info(pathName, "adminLogin email =", req.body.email);
  var errorMessage =
    "Sorry but we couldn't log you in. Please verify the details you entered and try again";
  var params = {
    email: req.body.email,
    password: req.body.password,
    type: req.body.type,
  };
  if (
    !params.email ||
    params.email == "" ||
    !params.password ||
    params.password == ""
  ) {
    logger.error(
      pathName,
      'adminLogin -Error_Message -validation failed "email,password is required"    :',
      __line
    );
    return res
      .status(200)
      .json({ status_code: 400, status_message: "Email/password is required" });
  }
  if (!params.type || params.type == "") {
    logger.error(
      pathName,
      'adminLogin -Error_Message -validation failed "Type is required"    :',
      __line
    );
    return res
      .status(200)
      .json({ status_code: 400, status_message: "Type is required" });
  }
  if (params.password.length < 25) {
    params.password = crypto
      .createHash("md5")
      .update(params.password)
      .digest("hex");
  }
  try {
    var user_type;
    if (req.body.type.toLowerCase() == "admin") {
      user_type = "(1, 2)";
    } else if (req.body.type.toLowerCase() == "doctor") {
      user_type = "(3)";
    } else if (req.body.type.toLowerCase() == "representative") {
      user_type = "(5)";
    }
    var adminexist = await db.execQuery(
      "SELECT users.*,module_assign_id,role,module_id FROM users LEFT JOIN module_assign ON users.user_type_id = module_assign_id WHERE  email = '" +
        params.email +
        "' AND password = '" +
        params.password +
        "' AND is_active = 1 AND user_type_id  IN " +
        user_type
    );

    // var adminexist = await models.user.findOne({ where: { email: params.email, password: params.password, user_type: { [Op.in]: user_type } } });

    if (adminexist.length > 0) {
      if (adminexist[0].is_active != 1) {
        logger.error(
          pathName,
          "adminLogin - ,Error_Message :-, account disabled   :",
          __line
        );
        return res
          .status(200)
          .json({
            status_code: 403,
            status_message:
              "Your account has been disabled. Please contact the system administrator.",
          });
      } else {
        common.getJwtAuthToken(
          adminexist[0].uuid,
          async function (err, callbackresult) {
            if (err) {
              res
                .status(200)
                .json({ status_code: 401, status_message: errorMessage });
            } else if (callbackresult.status_code == 200) {
              if (req.body.type.toLowerCase() == "doctor") {
                await db.execQuery(
                  "UPDATE users SET is_available = 1 WHERE users_id ='" +
                    adminexist[0].users_id +
                    "'"
                );
              }
              adminexist[0].access_token = callbackresult.data.access_token;
              res
                .status(200)
                .json({
                  status_code: 200,
                  status_message: "Successfully Logged In",
                  result: adminexist[0],
                });
            }
          }
        );
      }
    } else {
      res
        .status(200)
        .json({
          status_code: 404,
          status_message:
            "This email/password combination is not associated with an existing account.Please try again",
        });
    }
  } catch (err) {
    logger.error(pathName, "admin login -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "internal server error" });
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
user.sendOtp = async function (req, res) {
  logger.info(pathName, "send Otp ");
  var expireMinutes = 5;
  let ipAddress =
    (
      req.headers["X-Forwarded-For"] ||
      req.headers["x-forwarded-for"] ||
      ""
    ).split(",")[0] || req.client.remoteAddress;
  var curDate = moment().format("YYYY-MM-DD HH:mm:ss");
  var expiredTime = moment(curDate)
    .add(expireMinutes, "minutes")
    .format("YYYY-MM-DD HH:mm:ss");
  var generatedOTP = Math.floor(Math.random() * 900000) + 100000;
  var insertOtp = {
    expiry_timestamp: expiredTime,
    module: req.body.module,
    otp: generatedOTP,
    ip_address: ipAddress,
  };
  var msg;
  var sendEmail;
  var insertOtpEmail;
  var emailtitle = "Verification Code";
  var emaillang = "en";
  var msgtext = `Your verification code for sign up/sign in with Dr. LaBike is  ${generatedOTP}. This will expire in 5 Minutes.`;
  try {
    if (req.body.language && req.body.language == "es") {
      emailtitle = "Tu c贸digo de ingreso Dr. LaBike";
      msgtext = `Tu c贸digo de ingreso a Dr. LaBike es: ${generatedOTP}.
Expira en 5 minutos.`;
      emaillang = "es";
    }
    if (!req.body.module || req.body.module == "") {
      return res
        .status(200)
        .json({
          status_code: 400,
          status_message: "Process module is missing.",
        });
    }
    if (req.body.type == 1) {
      if (
        !req.body.email ||
        common.emailValidation(req.body.email) ||
        req.body.email.trim() == ""
      ) {
        return res
          .status(200)
          .json({
            status_code: 400,
            status_message: "Email validation faild.",
          });
      }
      msg = {
        from: "Dr. LaBike <" + config.sendgrid.sendgridemail + ">",
        to: req.body.email,
        subject: emailtitle,
        html: common.sendOtpTemplate(req.body.module, generatedOTP, emaillang),
      };
      sendEmail = await sgMail.send(msg);
      if (sendEmail[0].statusCode == 202) {
        insertOtp.email = req.body.email;
        insertOtpEmail = await db.inputQuery(
          "INSERT INTO verification_codes SET ?",
          insertOtp
        );
        if (insertOtpEmail) {
          res
            .status(200)
            .json({
              status_code: 200,
              status_message: "Verification code send successfully",
            });
        } else {
          res
            .status(200)
            .json({
              status_code: 500,
              status_message: "Internal Server Error",
            });
        }
      } else {
        res
          .status(200)
          .json({ status_code: 500, status_message: "Internal Server Error" });
      }
    } else if (req.body.type == 2) {
      if (
        !req.body.phone ||
        common.phoneValidation(req.body.phone) ||
        req.body.phone.trim() == ""
      ) {
        return res
          .status(200)
          .json({
            status_code: 400,
            status_message: "Phone No validation faild.",
          });
      }
      if (!req.body.country_code || req.body.country_code.trim() == "") {
        return res
          .status(200)
          .json({
            status_code: 400,
            status_message: "Country code validation faild.",
          });
      }

      // var options = {
      // 	method: 'POST',
      // 	url: 'https://api.labsmobile.com/json/send',
      // 	headers:
      // 	{
      // 		'Cache-Control': 'no-cache',
      // 		Authorization: 'Basic ' + btoa("bernardoaltamirano@grupomh.mx:Imperia_7220041007721"),
      // 		'Content-Type': 'application/json'
      // 	},
      // 	body: JSON.stringify({
      // 		message: msgtext,
      // 		tpoa: 'Sender',
      // 		recipient:
      // 			[{ msisdn: '91' + req.body.phone }
      // 			]
      // 	})

      // };
      // request(options, async function (error, response, body) {
      // 	if (error) {
      // 		return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
      // 	}
      // 	insertOtp.phone = req.body.phone;
      // 	var insertOtpPhone = await db.inputQuery('INSERT INTO verification_codes SET ?', insertOtp);
      // 	if (insertOtpPhone) {
      // 		res.status(200).json({ "status_code": 200, "status_message": "Verification code send successfully" });
      // 	} else {
      // 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
      // 	}
      // });
      smsServer.messages.create(
        {
          to: "+91" + req.body.phone,
          from: config.twilio.smsFrom,
          body: msgtext,
        },
        async function (err, message) {
          if (err) {
            return res
              .status(200)
              .json({
                status_code: 500,
                status_message: "Internal Server Error",
              });
          }
          insertOtp.phone = req.body.phone;
          var insertOtpPhone = await db.inupquery(
            "INSERT INTO verification_codes SET ?",
            insertOtp
          );
          if (insertOtpPhone) {
            res
              .status(200)
              .json({
                status_code: 200,
                status_message: "Verification code send successfully",
              });
          } else {
            res
              .status(200)
              .json({
                status_code: 500,
                status_message: "Internal Server Error",
              });
          }
        }
      );
    } else if (req.body.type == 3) {
      if (
        !req.body.email ||
        common.emailValidation(req.body.email) ||
        req.body.email.trim() == ""
      ) {
        return res
          .status(200)
          .json({
            status_code: 400,
            status_message: "Email validation faild.",
          });
      }
      if (
        !req.body.phone ||
        common.phoneValidation(req.body.phone) ||
        req.body.phone.trim() == ""
      ) {
        return res
          .status(200)
          .json({
            status_code: 400,
            status_message: "Phone No validation faild.",
          });
      }
      if (!req.body.country_code || req.body.country_code.trim() == "") {
        return res
          .status(200)
          .json({
            status_code: 400,
            status_message: "Country code validation faild.",
          });
      }

      // var options = {
      // 	method: 'POST',
      // 	url: 'https://api.labsmobile.com/json/send',
      // 	headers:
      // 	{
      // 		'Cache-Control': 'no-cache',
      // 		Authorization: 'Basic ' + btoa("bernardoaltamirano@grupomh.mx:Imperia_7220041007721"),
      // 		'Content-Type': 'application/json'
      // 	},
      // 	body: JSON.stringify({
      // 		message: msgtext,
      // 		tpoa: 'Sender',
      // 		recipient:
      // 			[{ msisdn: '91' + req.body.phone }
      // 			]
      // 	})

      // };
      smsServer.messages.create(
        {
          to: "+91" + req.body.phone,
          from: config.twilio.smsFrom,
          body: msgtext,
        },
        async function (err, message) {
          console.log(message);
          if (err) {
            return res
              .status(200)
              .json({
                status_code: 500,
                status_message: "Internal Server Error",
              });
          }
          msg = {
            from: "Dr. LaBike <" + config.sendgrid.sendgridemail + ">",
            to: req.body.email,
            subject: emailtitle,
            html: common.sendOtpTemplate(
              req.body.module,
              generatedOTP,
              emaillang
            ),
          };
          sendEmail = await sgMail.send(msg);
          insertOtp.phone = req.body.phone;
          if (sendEmail[0].statusCode == 202) {
            insertOtp.email = req.body.email;
          }
          var insertOtpPhone = await db.inputQuery(
            "INSERT INTO verification_codes SET ?",
            insertOtp
          );
          if (insertOtpPhone) {
            res
              .status(200)
              .json({
                status_code: 200,
                status_message: "Verification code send successfully",
              });
          } else {
            res
              .status(200)
              .json({
                status_code: 500,
                status_message: "Internal Server Error",
              });
          }
        }
      );
      // request(options, async function (error, response, body) {
      // 	if (error) {
      // 		return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
      // 	}

      // 	msg = {
      // 		from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
      // 		to: req.body.email,
      // 		subject: emailtitle,
      // 		html: common.sendOtpTemplate(req.body.module, generatedOTP, emaillang)
      // 	};
      // 	sendEmail = await sgMail.send(msg);
      // 	insertOtp.phone = req.body.phone;
      // 	if (sendEmail[0].statusCode == 202) {
      // 		insertOtp.email = req.body.email;
      // 	}
      // 	var insertOtpPhone = await db.inputQuery('INSERT INTO verification_codes SET ?', insertOtp);
      // 	if (insertOtpPhone) {
      // 		res.status(200).json({ "status_code": 200, "status_message": "Verification code send successfully" });
      // 	} else {
      // 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
      // 	}
      // })
    } else {
      logger.error(
        pathName,
        "send otp mandatory field type is required :",
        __line
      );
      return res
        .status(200)
        .json({
          status_code: 400,
          status_message: "Process type is missing .",
        });
    }
  } catch (err) {
    logger.error(pathName, "send otp -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};
// user.sendOtp = async function (req, res) {
// 	logger.info(pathName, 'send Otp ');
// 	var expireMinutes = 5;
// 	let ipAddress = (req.headers["X-Forwarded-For"] || req.headers["x-forwarded-for"] || '').split(',')[0] || req.client.remoteAddress;
// 	var curDate = moment().format("YYYY-MM-DD HH:mm:ss");
// 	var expiredTime = moment(curDate).add(expireMinutes, 'minutes').format("YYYY-MM-DD HH:mm:ss");
// 	var generatedOTP = Math.floor(Math.random() * 900000) + 100000;
// 	var insertOtp = {
// 		expiry_timestamp: expiredTime,
// 		module: req.body.module,
// 		otp: generatedOTP,
// 		ip_address: ipAddress
// 	}
// 	var msg;
// 	var sendEmail;
// 	var insertOtpEmail;
// 	try {
// 		if (!req.body.module || req.body.module == '') {
// 			return res.status(200).json({ "status_code": 400, "status_message": "Process module is missing." });
// 		}
// 		if (req.body.type == 1) {
// 			if (!req.body.email || common.emailValidation(req.body.email) || req.body.email.trim() == '') {
// 				return res.status(200).json({ "status_code": 400, "status_message": "Email validation faild." });
// 			}
// 			msg = {
// 				from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
// 				to: req.body.email,
// 				subject: "Verification Code",
// 				html: common.sendOtpTemplate(req.body.module, generatedOTP)
// 			};
// 			sendEmail = await sgMail.send(msg);
// 			if (sendEmail[0].statusCode == 202) {
// 				insertOtp.email = req.body.email;
// 				insertOtpEmail = await db.inupquery('INSERT INTO verification_codes SET ?', insertOtp);
// 				if (insertOtpEmail) {
// 					res.status(200).json({ "status_code": 200, "status_message": "Verification code send successfully" });
// 				} else {
// 					res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 				}
// 			} else {
// 				res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 			}

// 		} else if (req.body.type == 2) {
// 			if (!req.body.phone || common.phoneValidation(req.body.phone) || req.body.phone.trim() == '') {
// 				return res.status(200).json({ "status_code": 400, "status_message": "Phone No validation faild." });
// 			}
// 			if (!req.body.country_code || req.body.country_code.trim() == '') {
// 				return res.status(200).json({ "status_code": 400, "status_message": "Country code validation faild." });
// 			}

// 			var options = { method: 'POST',
//   url: 'https://api.labsmobile.com/json/send',
//   headers:
//   { 'Cache-Control': 'no-cache',
//      Authorization: 'Basic ' + btoa("bernardoaltamirano@grupomh.mx:Imperia_7220041007721"),
//      'Content-Type': 'application/json' },
//   body:JSON.stringify({ message: `Your verification code for sign up/sign in with Dr. LaBike is  ${generatedOTP}. This will expire in 5 Minutes.`,
//   tpoa: 'Sender',
//   recipient:
//   [{ msisdn: '52'+req.body.phone }
//      ] })

// };
// request(options,async function (error, response, body) {
//     if(error){
//         	return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
//     }
//     	insertOtp.phone = req.body.phone;
// 				var insertOtpPhone = await db.inupquery('INSERT INTO verification_codes SET ?', insertOtp);
// 				if (insertOtpPhone) {
// 					res.status(200).json({ "status_code": 200, "status_message": "Verification code send successfully" });
// 				} else {
// 					res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 				}
// });
// // 			smsServer.messages.create({
// // 				to: "+52" + req.body.phone,
// // 				from: config.twilio.smsFrom,
// // 				body: `Your verification code for sign up/sign in with admedic is  ${generatedOTP}. This will expire in 5 Minutes.`
// // 			}, async function (err, message) {
// // 				if (err) {
// // 					return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// // 				}
// // 				insertOtp.phone = req.body.phone;
// // 				var insertOtpPhone = await db.inupquery('INSERT INTO verification_codes SET ?', insertOtp);
// // 				if (insertOtpPhone) {
// // 					res.status(200).json({ "status_code": 200, "status_message": "Verification code send successfully" });
// // 				} else {
// // 					res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// // 				}
// // 			});
// 		} else if (req.body.type == 3) {
// 			if (!req.body.email || common.emailValidation(req.body.email) || req.body.email.trim() == '') {
// 				return res.status(200).json({ "status_code": 400, "status_message": "Email validation faild." });
// 			}
// 			if (!req.body.phone || common.phoneValidation(req.body.phone) || req.body.phone.trim() == '') {
// 				return res.status(200).json({ "status_code": 400, "status_message": "Phone No validation faild." });
// 			}
// 			if (!req.body.country_code || req.body.country_code.trim() == '') {
// 				return res.status(200).json({ "status_code": 400, "status_message": "Country code validation faild." });
// 			}

// var options = { method: 'POST',
//   url: 'https://api.labsmobile.com/json/send',
//   headers:
//   { 'Cache-Control': 'no-cache',
//      Authorization: 'Basic ' + btoa("bernardoaltamirano@grupomh.mx:Imperia_7220041007721"),
//      'Content-Type': 'application/json' },
//   body:JSON.stringify({ message: `Your verification code for sign up/sign in with Dr. LaBike is  ${generatedOTP}. This will expire in 5 Minutes.`,
//   tpoa: 'Sender',
//   recipient:
//   [{ msisdn: '52'+req.body.phone }
//      ] })

// };
// request(options,async function (error, response, body) {
//     if(error){
//         	return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
//     }

// 				msg = {
// 					from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
// 					to: req.body.email,
// 					subject: "Verification Code",
// 					html: common.sendOtpTemplate(req.body.module, generatedOTP)
// 				};
// 				sendEmail = await sgMail.send(msg);
// 				insertOtp.phone = req.body.phone;
// 				if (sendEmail[0].statusCode == 202) {
// 					insertOtp.email = req.body.email;
// 				}
// 				var insertOtpPhone = await db.inupquery('INSERT INTO verification_codes SET ?', insertOtp);
// 				if (insertOtpPhone) {
// 					res.status(200).json({ "status_code": 200, "status_message": "Verification code send successfully" });
// 				} else {
// 					res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 				}
// 			})
// 		} else {
// 			logger.error(pathName, 'send otp mandatory field type is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Process type is missing ." });
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'send otp -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}

// }

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
user.verifyOtp = async function (req, res) {
  logger.info(pathName, "verify otp email/Phone", req.params.emailPhone);
  try {
    if (
      !req.params.emailPhone ||
      (req.params.emailPhone && req.params.emailPhone.trim() == "")
    ) {
      logger.error(
        pathName,
        "verify otp mandatory field email/phone is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Email/Phone is missing" });
    }
    if (!req.params.otp || (req.params.otp && req.params.otp == "")) {
      logger.error(
        pathName,
        "verify otp mandatory field otp is required :",
        __line
      );
      return res
        .status(200)
        .json({
          status_code: 400,
          status_message: "One Time Password is missing.",
        });
    }
    var curDate = moment();
    var otpExist = await db.execQuery(
      "SELECT verification_id,otp,expiry_timestamp,created_at FROM verification_codes WHERE email = '" +
        req.params.emailPhone +
        "' OR phone = '" +
        req.params.emailPhone +
        "' ORDER BY verification_id DESC"
    );
    if (otpExist.length > 0) {
      if (
        curDate >= otpExist[0].created_at &&
        curDate <= otpExist[0].expiry_timestamp &&
        otpExist[0].otp == req.params.otp
      ) {
        var deleteOTP = await db.execQuery(
          "DELETE FROM verification_codes WHERE verification_id=" +
            otpExist[0].verification_id
        );
        res
          .status(200)
          .json({
            status_code: 200,
            status_message: "OTP successfully verified",
          });
      } else {
        res
          .status(200)
          .json({
            status_code: 406,
            status_message:
              'The Code you provided is not valid. Please either re-enter the correct code or select "Resend" to send a new code',
          });
      }
    } else {
      res
        .status(200)
        .json({
          status_code: 404,
          status_message:
            'The Code you provided is not valid. Please either re-enter the correct code or select "Resend" to send a new code',
        });
    }
  } catch (err) {
    logger.error(pathName, "verify  otp -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
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
user.checkExistUser = async function (req, res) {
  logger.info(pathName, "checkExistUser");
  try {
    if (!req.params.emailPhone || req.params.emailPhone.trim() == "") {
      logger.error(
        pathName,
        "checkExistUser  mandatory field Email/phone is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Email/phone is missing." });
    }
    if (!req.params.type || req.params.type.trim() == "") {
      logger.error(
        pathName,
        "checkExistUser  mandatory field type is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "User type is missing." });
    }
    var type = await db.execQuery(
      "SELECT module_assign_id FROM module_assign WHERE role = '" +
        req.params.type +
        "'"
    );
    if (type.length <= 0) {
      logger.error(pathName, "check user exist:", __line);
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Invalid user type pass." });
    }
    var existuser = await db.execQuery(
      "SELECT * FROM users WHERE ( email = '" +
        req.params.emailPhone +
        "' OR phone = '" +
        req.params.emailPhone +
        "') AND user_type_id = " +
        type[0].module_assign_id
    );
    logger.error(existuser);
    if (existuser.length > 0) {
      logger.error(pathName, "User already exist:", __line);
      return res
        .status(200)
        .json({
          status_code: 200,
          status_message: "This Email/phone already exist .",
        });
    } else {
      return res
        .status(200)
        .json({
          status_code: 404,
          status_message:
            "Sorry! You are not registered please contact your administartion",
        });
    }
  } catch (err) {
    // in case of error or exception
    logger.error(pathName, "create vet -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

// /**
//  * @swagger
//  * /user/patientSignIn:
//  *   post:
//  *     tags:
//  *       - user
//  *     description: user signIn as a patient
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     parameters:
//  *       - name: body
//  *         description:  user signIn as a patient send type like doctor/patient
//  *         in: body
//  *         required: true
//  *         schema:
//  *           type: object
//  *           properties:
//  *             emailPhone:
//  *               type: string
//  *             type:
//  *               type: string
//  *     responses:
//  *       200:
//  *         description: patient signIn successfully
//  *       404:
//  *         description: patient doesn't exist
//  */
// user.patientSignIn = async function (req, res) {
// 	logger.info(pathName, 'Patient signIn');
// 	console.log(req);
// 	try {
// 		if (!req.body.emailPhone || (req.body.emailPhone && req.body.emailPhone.trim() == '')) {
// 			logger.error(pathName, 'Patient signIn mandatory field email/phone is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required email/phone field for verification" });
// 		}
// 		if (common.emailValidation(req.body.emailPhone) && common.phoneValidation(req.body.emailPhone)) {
// 			logger.error(pathName, 'Patient signIn mandatory field email/phone is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Invalid email/phone. Please check and try again." });
// 		}
// 		if (!req.body.type || (req.body.type && req.body.type.trim() == '')) {
// 			logger.error(pathName, 'Patient signIn mandatory field type is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required type field." });
// 		}
// 		var isNumber = isNaN(req.body.emailPhone);
// 		var type = await db.exequery("SELECT module_assign_id FROM module_assign WHERE role = '" + req.body.type + "'");
// 		if (type.length <= 0) {
// 			logger.error(pathName, 'check user type exist:', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for creating user type." });
// 		}
// 		var query;
// 		if (isNumber) {
// 			query = "SELECT users.*,camp_lists.hospital_name,camp_lists.address as h_address,camp_lists.tele_phone,camp_lists.city as h_city,camp_lists.zip_code as h_zip_code,specialities.name as s_name FROM users LEFT join camp_lists on users.camp_id = camp_lists.camp_id LEFT join specialities on users.speciality = specialities.id WHERE email = '" + req.body.emailPhone + "' AND user_type_id = '" + type[0].module_assign_id + "' AND users.parent_id = 0"
// 		} else {
// 			query = "SELECT users.*,camp_lists.hospital_name,camp_lists.address as h_address,camp_lists.tele_phone,camp_lists.city as h_city,camp_lists.zip_code as h_zip_code,specialities.name as s_name  FROM users LEFT join camp_lists on users.camp_id = camp_lists.camp_id LEFT join specialities on users.speciality = specialities.id WHERE  phone = '" + req.body.emailPhone + "' AND user_type_id = '" + type[0].module_assign_id + "' AND users.parent_id = 0"
// 		}
// 		console.log(query)
// 		var existpatient = await db.exequery(query);
// 		console.log(existpatient);
// 		if (existpatient.length > 0) {
// 			common.getJwtAuthToken(existpatient[0].uuid,async function (err, callbackresult) {
// 				if (err) {
// 					res.status(200).json({ "status_code": 401, "status_message": common.errorGenerateAuthToken });
// 				} else if (callbackresult.status_code == 200) {
// 				    await db.exequery('UPDATE users SET is_available =1 WHERE users_id =\'' + existpatient[0].users_id + '\'');
// 					existpatient[0].access_token = callbackresult.data.access_token;
// 					existpatient[0].is_available = 1;
// 					res.status(200).json({ "status_code": 200, "status_message": "Patient sign In successfully", "result": existpatient[0] });
// 				}
// 			});
// 		} else {
// 			return res.status(200).json({ "status_code": 400, "status_message": "This Email/phone doesn't exist Please try again with another details." });
// 		}
// 	} catch (err) {
// 		// in case of error or exception
// 		logger.error(pathName, 'Patient signin -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }

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
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: patient signIn successfully
 *       404:
 *         description: patient doesn't exist
 */
user.patientSignIn = async function (req, res) {
  logger.info(pathName, "Patient signIn");
  try {
    if (
      !req.body.emailPhone ||
      (req.body.emailPhone && req.body.emailPhone.trim() == "")
    ) {
      logger.error(
        pathName,
        "Patient signIn mandatory field email/phone is required :",
        __line
      );
      return res
        .status(200)
        .json({
          status_code: 400,
          status_message: "Required email/phone field for verification",
        });
    }
    if (
      req.body.login_type &&
      !req.body.password &&
      req.body.password &&
      req.body.password == ""
    ) {
      logger.error(
        pathName,
        "Patient signIn mandatory field password is required :",
        __line
      );
      return res
        .status(200)
        .json({
          status_code: 400,
          status_message: "Invalid password. Please check and try again.",
        });
    }
    if (
      common.emailValidation(req.body.emailPhone) &&
      common.phoneValidation(req.body.emailPhone)
    ) {
      logger.error(
        pathName,
        "Patient signIn mandatory field email/phone is required :",
        __line
      );
      return res
        .status(200)
        .json({
          status_code: 400,
          status_message: "Invalid email/phone. Please check and try again.",
        });
    }
    if (!req.body.type || (req.body.type && req.body.type.trim() == "")) {
      logger.error(
        pathName,
        "Patient signIn mandatory field type is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Required type field." });
    }
    var isNumber = isNaN(req.body.emailPhone);
    var type = await db.execQuery(
      "SELECT module_assign_id FROM module_assign WHERE role = '" +
        req.body.type +
        "'"
    );
    if (type.length <= 0) {
      logger.error(pathName, "check user type exist:", __line);
      return res
        .status(200)
        .json({
          status_code: 400,
          status_message:
            "Please contact administrator for creating user type.",
        });
    }
    var query;
    var err_msg =
      "This Email/phone doesn't exist Please try again with another details.";
    if (isNumber) {
      query =
        "SELECT users.*,camp_lists.camp_name,camp_lists.address as h_address,camp_lists.tele_phone,camp_lists.city as h_city,camp_lists.zip_code as h_zip_code,specialities.name as s_name FROM users LEFT join camp_lists on users.camp_id = camp_lists.camp_id LEFT join specialities on users.speciality = specialities.id WHERE email = '" +
        req.body.emailPhone +
        "' AND user_type_id = '" +
        type[0].module_assign_id +
        "' AND users.parent_id = 0";
    } else {
      query =
        "SELECT users.*,camp_lists.camp_name,camp_lists.address as h_address,camp_lists.tele_phone,camp_lists.city as h_city,camp_lists.zip_code as h_zip_code,specialities.name as s_name  FROM users LEFT join camp_lists on users.camp_id = camp_lists.camp_id LEFT join specialities on users.speciality = specialities.id WHERE  phone = '" +
        req.body.emailPhone +
        "' AND user_type_id = '" +
        type[0].module_assign_id +
        "' AND users.parent_id = 0";
    }
    if (req.body.login_type) {
      query =
        query +
        " AND password = '" +
        crypto.createHash("md5").update(req.body.password).digest("hex") +
        "'";
      err_msg =
        "This Email/phone and password combination doesn't exist Please try again with another details.";
    }
    var existpatient = await db.execQuery(query);
    if (existpatient.length > 0) {
      common.getJwtAuthToken(
        existpatient[0].uuid,
        async function (err, callbackresult) {
          if (err) {
            res
              .status(200)
              .json({
                status_code: 401,
                status_message: common.errorGenerateAuthToken,
              });
          } else if (callbackresult.status_code == 200) {
            var token;
            if (req.body.device_token) {
              token = req.body.device_token.fireBaseToken;
            } else {
              token = null;
            }
            await db.execQuery(
              "UPDATE users SET is_available =1,device_token ='" +
                token +
                "' WHERE users_id ='" +
                existpatient[0].users_id +
                "'"
            );
            existpatient[0].access_token = callbackresult.data.access_token;
            existpatient[0].is_available = 1;
            res
              .status(200)
              .json({
                status_code: 200,
                status_message: "Patient sign In successfully",
                result: existpatient[0],
              });
          }
        }
      );
    } else {
      return res
        .status(200)
        .json({ status_code: 400, status_message: err_msg });
    }
  } catch (err) {
    // in case of error or exception
    logger.error(pathName, "Patient signin -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
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
user.generateSessionToken = function (req, res) {
  logger.info(pathName, "generate session token");
  try {
    common.getOpenTokCallback(function (err, opentok) {
      if (err) {
        return res
          .status(500)
          .json({ status_code: 500, status_message: "Internal Server Error" });
      }
      if (opentok.status_code == 200) {
        var data = {};
        data.session = opentok.result.session;
        data.token = opentok.result.token;
        return res
          .status(200)
          .json({
            status_code: 200,
            status_message: "Opentok session token for make call",
            result: data,
          });
      }
    });
  } catch (err) {
    logger.error(pathName, "generate session token :", err, __line);
    return res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

// /**
//  * @swagger
//  * /admin/getDoctorList/:camp_id/:page?/:limit?:
//  *   get:
//  *     tags:
//  *       - user
//  *     description: get doctor list based on camp
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     responses:
//  *       200:
//  *         description: get doctor list Successfully
//  *       404:
//  *         description: doctor list doesn't exist
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  */
// user.getDoctorList = async function (req, res) {
// 	logger.info(pathName, 'Get Doctor List', req.params.camp_id);
// 	try {
// 		var limit = req.params.limit || 20;
// 		var offset = req.params.page > 0 ? req.params.page - 1 : 0;
// 		var type = await db.execQuery("SELECT module_assign_id FROM module_assign WHERE role = 'doctor'");
// 		if (type.length <= 0) {
// 			logger.error(pathName, 'get Doctor list :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for creating user type." });
// 		}
// 		var query = 'SELECT users.*,specialities.name as s_name FROM users LEFT join specialities on specialities.id = users.speciality where user_type_id = \'' + type[0].module_assign_id + '\'';
// 		if (req.params.camp_id && req.params.camp_id.trim() != "0") {
// 			query = query + ' AND camp_id = \'' + req.params.camp_id + '\'';
// 		}
// 		query = query + ' ORDER BY users_id DESC  limit ' + limit + ' offset ' + limit * offset;
// 		var doctorlist = await db.execQuery(query);
// 		if (doctorlist.length > 0) {
// 			res.status(200).json({ "status_code": 200, "status_message": "Get Doctor List successfully", "result": doctorlist });
// 		} else {
// 			res.status(200).json({ "status_code": 404, "status_message": "Doctor list Doesn't exist" });
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'Get Doctor List -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }
//
//
// /**
//  * @swagger
//  * /admin/getAgentList/:page?/:limit?:
//  *   get:
//  *     tags:
//  *       - user
//  *     description: get agent list based on camp
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     responses:
//  *       200:
//  *         description: get agent list Successfully
//  *       404:
//  *         description: agent list doesn't exist
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  */
// user.getAgentList = async function (req, res) {
// 	logger.info(pathName, 'Get Agent List');
// 	try {
// 		var limit = req.params.limit || 20;
// 		var offset = req.params.page > 0 ? req.params.page - 1 : 0;
// 		var type = await db.execQuery("SELECT module_assign_id FROM module_assign WHERE role = 'representative'");
// 		if (type.length <= 0) {
// 			logger.error(pathName, 'get Doctor list :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for creating user type." });
// 		}
// 		var query = 'SELECT * FROM users where user_type_id = \'' + type[0].module_assign_id + '\'';
// // 		if (req.params.camp_id && req.params.camp_id.trim() != "0") {
// // 			query = query + ' AND camp_id = \'' + req.params.camp_id + '\'';
// // 		}
// 		query = query + ' ORDER BY users_id DESC  limit ' + limit + ' offset ' + limit * offset;
// 		var agentList = await db.execQuery(query);
// 		if (agentList.length > 0) {
// 			res.status(200).json({ "status_code": 200, "status_message": "Get Agent List successfully", "result": agentList });
// 		} else {
// 			res.status(200).json({ "status_code": 404, "status_message": "Agent list Doesn't exist" });
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'Get Agent List -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }
//
// /**
//  * @swagger
//  * /admin/addPatient:
//  *   post:
//  *     tags:
//  *       - user
//  *     description: add user as a patient by admin
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     parameters:
//  *       - name: body
//  *         description:  add user as a patient by admin
//  *         in: body
//  *         required: true
//  *         schema:
//  *           type: object
//  *           properties:
//  *             email:
//  *               type: string
//  *             phone:
//  *               type: string
//  *             first_name:
//  *               type: string
//  *             middle_name:
//  *               type: string
//  *             last_name:
//  *               type: string
//  *             date_of_birth:
//  *               type: string
//  *             camp_id:
//  *               type: string
//  *             gender:
//  *               type: string
//  *             address:
//  *               type: string
//  *             aadhaar_number:
//  *               type: string
//  *             city:
//  *               type: string
//  *             country:
//  *               type: string
//  *             language:
//  *               type: string
//  *             image:
//  *               type: string
//  *     responses:
//  *       201:
//  *         description: patient add successfully
//  *       409:
//  *         description: patient already exist
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  */
// user.addPatient = async function (req, res) {
// 	logger.info(pathName, 'Add Patient');
// 	try {
// 		if (req.body.email && req.body.email.trim() != '' && common.emailValidation(req.body.email)) {
// 			logger.error(pathName, 'patient signup mandatory field email is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required email field for verification" });
// 		}
// 		if (req.body.phone && req.body.phone.trim() != '' && common.phoneValidation(req.body.phone)) {
// 			logger.error(pathName, 'patient signup mandatory field phone is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required phone field for verification" });
// 		}
// // 		if (!req.body.camp_id || (req.body.camp_id && req.body.camp_id.trim() == '')) {
// // 			logger.error(pathName, 'patient signup mandatory field camp id is required :', __line);
// // 			return res.status(200).json({ "status_code": 400, "status_message": "Required camp id field." });
// // 		}
// 		if (!req.body.address || req.body.address.trim() == '' || !req.body.city || req.body.city.trim() == '') {
// 			logger.error(pathName, 'patient signup mandatory field address/city is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required address/city field for verification" });
// 		}
// 		if (!req.body.aadhaar_number || req.body.aadhaar_number.trim() == '') {
// 			logger.error(pathName, 'patient signup mandatory field address/city is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required aadhaar number field for verification" });
// 		}
// 		if (!req.body.gender || req.body.gender.trim() == '') {
// 			logger.error(pathName, 'patient signup mandatory field gender is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required gender field for verification" });
// 		}
// 		if (!req.body.first_name || req.body.first_name.trim() == '') {
// 			logger.error(pathName, 'patient signup mandatory field first name is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required first name field for verification" });
// 		}
// 		if(req.body.camp_id && req.body.camp_id != ''){
//     		var existCamp = await db.execQuery("SELECT camp_id FROM camp_lists WHERE camp_id = '" + req.body.camp_id + "' AND is_active = 1");
//     		if (existCamp.length <= 0) {
//     			logger.error(pathName, 'invalid camp id:', __line);
//     			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for get camp id." });
//     		}
// 		}
//
// 		// var isNumber = isNaN(req.body.emailPhone);
// 		var type = await db.execQuery("SELECT module_assign_id FROM module_assign WHERE role = 'patient'");
// 		if (type.length <= 0) {
// 			logger.error(pathName, 'check user type exist:', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for creating user type." });
// 		}
// 		// var query;
// 		// if (isNumber) {
// 		var query = "SELECT * FROM users WHERE (aadhaar_number = '" + req.body.aadhaar_number + "') AND user_type_id = '" + type[0].module_assign_id + "' AND parent_id = 0"
// 		// } else {
// 		// query = "SELECT * FROM users WHERE  phone = '" + req.body.emailPhone + "' AND user_type_id = '" + type[0].module_assign_id + "' AND parent_id = 0"
// 		// }
// 		var existpatient = await db.execQuery(query);
// 		if (existpatient.length > 0) {
// 			logger.error(pathName, 'Patient already exist:', __line);
// 			return res.status(200).json({ "status_code": 409, "status_message": "This Email/phone already exist Please try again with another details." });
// 		}
// 		var params = {
// 			uuid: uuidv4(),
// 			is_active: 1,
// 			user_type_id: type[0].module_assign_id,
// 			camp_id: req.body.camp_id,
// 			email: req.body.email,
// 			first_name:req.body.first_name,
//             last_name:req.body.last_name,
//             middle_name:req.body.middle_name,
// 			phone: req.body.phone,
// 			gender: req.body.gender,
// 			password:crypto.createHash("md5").update('123456').digest("hex"),
// 			address1: req.body.address,
// 			aadhaar_number: req.body.aadhaar_number,
// 			language: req.body.language,
// 			city: req.body.city,
// 			country: req.body.country,
// 			image:req.body.image
// 		}
// 		if(req.body.date_of_birth && req.body.date_of_birth!=''){
// 		     params.date_of_birth=req.body.date_of_birth;
// 		}
// 		var createPatient = await db.inputQuery('INSERT INTO users SET ?', params);
// 		if (createPatient) {
// 			res.status(200).json({ "status_code": 201, "status_message": "Patient added successfully", "result": createPatient });
// 		} else {
// 			res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 		}
// 	} catch (err) {
// 		// in case of error or exception
// 		logger.error(pathName, 'add patient -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }
//
// /**
//  * @swagger
//  * /admin/getPatientList/:camp_id/:page?/:limit?:
//  *   get:
//  *     tags:
//  *       - user
//  *     description: get patient list based on camp
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     responses:
//  *       200:
//  *         description: get patient list Successfully
//  *       404:
//  *         description: patient list doesn't exist
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  */
// user.getPatientList = async function (req, res) {
// 	logger.info(pathName, 'Get Patient List', req.params.camp_id);
// 	try {
// 		var limit = req.params.limit || 20;
// 		var offset = req.params.page > 0 ? req.params.page - 1 : 0;
// 		var type = await db.execQuery("SELECT module_assign_id FROM module_assign WHERE role = 'patient'");
// 		if (type.length <= 0) {
// 			logger.error(pathName, 'get Patient list :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for creating user type." });
// 		}
// 		var query = 'SELECT * FROM users where user_type_id = \'' + type[0].module_assign_id + '\'';
// 		if (req.params.camp_id && req.params.camp_id.trim() != "0") {
// 			query = query + ' AND camp_id = \'' + req.params.camp_id + '\'';
// 		}
// 		query = query + ' ORDER BY users_id DESC  limit ' + limit + ' offset ' + limit * offset;
// 		var patientlist = await db.execQuery(query);
// 		if (patientlist.length > 0) {
// 			res.status(200).json({ "status_code": 200, "status_message": "Get Patient List successfully", "result": patientlist });
// 		} else {
// 			res.status(200).json({ "status_code": 404, "status_message": "Patient list Doesn't exist" });
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'Get Patient List -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }
//
//
// /**
//  * @swagger
//  * /admin/resetPassword:
//  *   post:
//  *     tags:
//  *       - user
//  *     description: reset password
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     parameters:
//  *       - in: body
//  *         name: body
//  *         description: reset password
//  *         schema:
//  *           type: object
//  *           properties:
//  *             user_id:
//  *               type: string
//  *             role:
//  *               type: string
//  *             camp_id:
//  *               type: string
//  *             password:
//  *               type: string
//  *     responses:
//  *       200:
//  *         description: Reset password successfully
//  *       500:
//  *         description: Internal Server Error
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  */
// user.resetPassword = async function (req, res) {
// 	logger.info(pathName, 'reset Password id ', req.body.user_id);
// 	try {
// 		if (!req.body.user_id || req.body.user_id == '') {
// 			logger.error(pathName, 'reset password mandatory field user idis required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "User id is missing." });
// 		}
// 		if (!req.body.camp_id || req.body.camp_id == '') {
// 			logger.error(pathName, 'reset password mandatory field camp_id is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Camp id is missing" });
// 		}
// 		if (!req.body.role || req.body.role == '') {
// 			logger.error(pathName, 'reset password mandatory field role is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Role is missing." });
// 		}
// 		if (!req.body.password || req.body.password.trim() == '' || common.checkPassword(req.body.password)) {
// 			logger.error(pathName, 'reset password mandatory field password is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Invalid password Please fill proper formate one numeric ,one Uppercase latter,one special character and length 8-16 digit ." });
// 		}
// 		if(req.body.password.length<20){
// 		    req.body.password = crypto.createHash("md5").update(req.body.password).digest("hex");
// 		}
// 		var params = {
// 			password: req.body.password
// 		}
// 		var updatePassword = await db.inputQuery('UPDATE users SET ? WHERE parent_id = 0  AND user_type_id =\''+req.body.role+'\' AND users_id =\'' + req.body.user_id + '\' AND camp_id = \''+req.body.camp_id+'\'', params);
// 		if (updatePassword.affectedRows > 0) {
// 			res.status(200).json({ "status_code": 200, "status_message": "Update password successfully" });
// 		} else {
// 			res.status(200).json({ "status_code": 404, "status_message": "Invalid user details. Please try again" });
// 		}
//
// 	} catch (err) {
// 		logger.error(pathName, 'reset password -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }

/**
 * @swagger
 * /admin/appointment/upcoming/:page/:limit/:camp_id:
 *   get:
 *     tags:
 *       - user
 *     description: Return all upcoming appointment by camp id
 *
 *     parameters:
 *       - name: id
 *         description: camp id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: All upcoming appointments list
 *       404:
 *         description: Appointment list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
//  user.upcomingAppointments = async function (req, res) {
// 	logger.info(pathName, 'Upcoming Appointments camp id ', req.params.camp_id);
// 	if (!req.params.camp_id || req.params.camp_id == '') {
// 		logger.error(pathName, 'Upcoming Appointments mandatory field camp id is required:', __line);
// 		return res.status(200).json({ "status_code": 400, "status_message": "Camp id is missing for get upcoming appointment." });
// 	}
// 	try {
// 		var limit =req.params.limit || 20;
// 		var offset = req.params.page>0?req.params.page-1:0;
// 		var query = "SELECT appointments.*,camp_lists.camp_name,users.name as d_name,users.email as d_email,users.phone as d_phone,u.name as p_name,u.email as p_email,u.phone as p_phone,user_call_logs.* FROM appointments LEFT JOIN users ON appointments.doctor_id = users.users_id LEFT JOIN camp_lists ON camp_lists.camp_id = users.camp_id LEFT JOIN users as u ON appointments.patient_id = u.users_id LEFT JOIN user_call_logs ON appointments.call_id = user_call_logs.id where  date >  NOW() AND user_call_logs.video_connect !=1 "
// 		if (req.params.camp_id && req.params.camp_id.trim() != "0") {
// 		    query = query + " AND users.camp_id="+req.params.camp_id;
// 		}
// 		query = query + " ORDER BY appointments.date DESC limit "+limit+" offset "+limit*offset;
// 		var appointmentDetails = await db.exequery(query );
// 		if (appointmentDetails.length > 0) {
// 			return res.status(200).json({ "status_code": 200, "status_message": "All Upcoming appointments", "result": appointmentDetails });
// 		} else {
// 			return res.status(200).json({ "status_code": 404, "status_message": "No upcoming appointments found" });
// 		}

// 	} catch (err) {
// 		logger.error(pathName, 'Upcoming Appointments by camp_id -Error :-', err, ':', __line);
// 		return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }
//  user.upcomingAppointments = async function (req, res) {
// 	logger.info(pathName, 'Upcoming Appointments camp id ', req.params.camp_id);
// 	if (!req.params.camp_id || req.params.camp_id == '') {
// 		logger.error(pathName, 'Upcoming Appointments mandatory field camp id is required:', __line);
// 		return res.status(200).json({ "status_code": 400, "status_message": "Camp id is missing for get upcoming appointment." });
// 	}
// 	try {
// 		var limit =req.params.limit || 20;
// 		var offset = req.params.page>0?req.params.page-1:0;
// 		var query = "SELECT appointments.id as appoint_id,appointments.*,camp_lists.camp_name,users.first_name as d_name,users.last_name as d_l_name,users.email as d_email,users.phone as d_phone,u.first_name as p_name,u.last_name as p_l_name,u.email as p_email,u.phone as p_phone,user_call_logs.* FROM appointments LEFT JOIN users ON appointments.doctor_id = users.users_id LEFT JOIN camp_lists ON camp_lists.camp_id = users.camp_id LEFT JOIN users as u ON appointments.patient_id = u.users_id LEFT JOIN user_call_logs ON appointments.call_id = user_call_logs.id where  date >  NOW() AND user_call_logs.video_connect !=1 "
// // 		if (req.params.camp_id && req.params.camp_id.trim() != "0") {
// // 		    query = query + " AND users.camp_id="+req.params.camp_id;
// // 		}
// 		query = query + " ORDER BY appointments.date DESC limit "+limit+" offset "+limit*offset;
// 		var appointmentDetails = await db.execQuery(query );
// 		if (appointmentDetails.length > 0) {
// 			return res.status(200).json({ "status_code": 200, "status_message": "All Upcoming appointments", "result": appointmentDetails });
// 		} else {
// 			return res.status(200).json({ "status_code": 404, "status_message": "No upcoming appointments found" });
// 		}
//
// 	} catch (err) {
// 		logger.error(pathName, 'Upcoming Appointments by camp_id -Error :-', err, ':', __line);
// 		return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }
//
// /**
//  * @swagger
//  * /admin/appointment/past/:page/:limit/:camp_id:
//  *   get:
//  *     tags:
//  *       - user
//  *     description: Return all past appointment by camp id
//  *     parameters:
//  *       - name: id
//  *         description: camp id
//  *         in: path
//  *         required: true
//  *         type: integer
//  *     responses:
//  *       200:
//  *         description: All past appointments list	by a camp id
//  *       404:
//  *         description: Appointments list doesn't exist
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  *
//  */
// // user.pastAppointments = async function (req, res) {
// // 	logger.info(pathName, 'Past Appointments camp id', req.params.camp_id);
// // 	if (!req.params.camp_id || req.params.camp_id == '') {
// // 		logger.error(pathName, 'Past Appointments mandatory field camp id is required:', __line);
// // 		return res.status(200).json({ "status_code": 400, "status_message": "Camp id is missing for get past appointment." });
// // 	}
// // 	try {
// // 		var limit =req.params.limit || 20;
// // 		var offset = req.params.page>0?req.params.page-1:0;
// // 			var query = "SELECT user_call_logs.id as call_id,camp_lists.camp_name,user_call_logs.*,users.name as d_name,users.email as d_email,users.phone as d_phone,u.name as p_name,u.email as p_email,u.phone as p_phone,appointments.status FROM user_call_logs LEFT JOIN users ON user_call_logs.doctor_id = users.users_id LEFT JOIN camp_lists ON camp_lists.camp_id = users.camp_id LEFT JOIN users as u ON user_call_logs.patient_id = u.users_id LEFT JOIN appointments ON user_call_logs.id = appointments.call_id where (user_call_logs.video_connect =1 OR (appointments.status = 'CANCELLED' AND appointments.date < NOW()) )"
// // 		if (req.params.camp_id && req.params.camp_id.trim() != "0") {
// // 		    query = query + " AND users.camp_id="+req.params.camp_id;
// // 		}
// // 		query = query + " ORDER BY user_call_logs.created_at DESC limit "+limit+" offset "+limit*offset;
// // 		var appointmentDetails = await db.exequery(query);
// // 		if (appointmentDetails.length > 0) {
// // 			res.status(200).json({ "status_code": 200, "status_message": "All past appointment List", "result": appointmentDetails });
// // 		} else {
// // 			res.status(200).json({ "status_code": 404, "status_message": "No past appointments found" });
// // 		}
// // 	} catch (err) {
// // 		logger.error(pathName, 'Past Appointments -Error :-', err, ':', __line);
// // 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// // 	}
// // }
// user.pastAppointments = async function (req, res) {
// 	logger.info(pathName, 'Past Appointments camp id', req.params.camp_id);
// 	if (!req.params.camp_id || req.params.camp_id == '') {
// 		logger.error(pathName, 'Past Appointments mandatory field camp id is required:', __line);
// 		return res.status(200).json({ "status_code": 400, "status_message": "Camp id is missing for get past appointment." });
// 	}
// 	try {
// 		var limit =req.params.limit || 20;
// 		var offset = req.params.page>0?req.params.page-1:0;
// 			var query = "SELECT user_call_logs.id as call_id,camp_lists.camp_name,user_call_logs.*,users.first_name as d_name,users.last_name as d_l_name,users.email as d_email,users.phone as d_phone,u.first_name as p_name,u.last_name as p_l_name,u.email as p_email,u.phone as p_phone,appointments.status,appointments.id as appoint_id FROM user_call_logs LEFT JOIN users ON user_call_logs.doctor_id = users.users_id LEFT JOIN camp_lists ON camp_lists.camp_id = users.camp_id LEFT JOIN users as u ON user_call_logs.patient_id = u.users_id LEFT JOIN appointments ON user_call_logs.id = appointments.call_id where (user_call_logs.video_connect =1)"
// // 		if (req.params.camp_id && req.params.camp_id.trim() != "0") {
// // 		    query = query + " AND users.camp_id="+req.params.camp_id;
// // 		}
// 		query = query + " ORDER BY user_call_logs.created_at DESC limit "+limit+" offset "+limit*offset;
// 		var appointmentDetails = await db.execQuery(query);
// 		if (appointmentDetails.length > 0) {
// 			res.status(200).json({ "status_code": 200, "status_message": "All past appointment List", "result": appointmentDetails });
// 		} else {
// 			res.status(200).json({ "status_code": 404, "status_message": "No past appointments found" });
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'Past Appointments -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }
//
// /**
//  * @swagger
//  * /admin/payment/:page/:limit/:camp_id:
//  *   get:
//  *     tags:
//  *       - user
//  *     description: Return all payment camp id
//  *     parameters:
//  *       - name: id
//  *         description: camp id
//  *         in: path
//  *         required: true
//  *         type: integer
//  *     responses:
//  *       200:
//  *         description: All past payment list	by a camp id
//  *       404:
//  *         description: payment list doesn't exist
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  *
//  */
// user.paymentRecord = async function (req, res) {
// 	logger.info(pathName, 'payment record camp id', req.params.camp_id);
// 	if (!req.params.camp_id || req.params.camp_id == '') {
// 		logger.error(pathName, 'Payment record mandatory field camp id is required:', __line);
// 		return res.status(200).json({ "status_code": 400, "status_message": "Camp id is missing for get past appointment." });
// 	}
// 	try {
// 		var limit =req.params.limit || 20;
// 		var offset = req.params.page>0?req.params.page-1:0;
// 			var query = "SELECT payments.* FROM `payments` LEFT JOIN users on users.users_id = payments.patient_id "
// 		if (req.params.camp_id && req.params.camp_id.trim() != "0") {
// 		    query = query + " where users.camp_id="+req.params.camp_id;
// 		}
// 		query = query + " ORDER BY payments.created_at DESC limit "+limit+" offset "+limit*offset;
// 		var paymentDetails = await db.execQuery(query);
// 		if (paymentDetails.length > 0) {
// 			res.status(200).json({ "status_code": 200, "status_message": "All payment record List", "result": paymentDetails });
// 		} else {
// 			res.status(200).json({ "status_code": 404, "status_message": "No payment record found" });
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'Payment record -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }
//
//
// /**
//  * @swagger
//  * /admin/appointment/delete/:appointment_id:
//  *   delete:
//  *     tags:
//  *       - user
//  *     description: delete an appointment by appointment id
//  *     parameters:
//  *       - name: id
//  *         description: appointment id
//  *         in: path
//  *         required: true
//  *         type: integer
//  *     responses:
//  *       200:
//  *         description: delete an appointment successfully
//  *       404:
//  *         description: Appointments doesn't exist
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  *
//  */
// user.deleteAppointment = async function (req, res) {
// 	logger.info(pathName, 'Delete Appointments', req.params.appointment_id);
// 	if (!req.params.appointment_id || req.params.appointment_id == '') {
// 		logger.error(pathName, 'Past Appointments mandatory field appointment id is required:', __line);
// 		return res.status(200).json({ "status_code": 400, "status_message": "Appointment id is missing for delete an appointment." });
// 	}
// 	try {
// 		var query = "delete FROM appointments WHERE id = "+req.params.appointment_id;
// 		var appointmentDelete = await db.execQuery(query);
// 		if (appointmentDelete.affectedRows > 0){
// 			res.status(200).json({ "status_code": 200, "status_message": "Delete an appointment", "result": appointmentDelete });
// 		} else {
// 			res.status(200).json({ "status_code": 404, "status_message": "No  appointment found" });
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'Delete Appointments -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }

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
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
user.logout = async function (req, res) {
  logger.info(pathName, "Logout uuid=", req.params.uuid);
  try {
    var params = {
      uuid: req.params.uuid,
      xauthtoken: req.headers["x-auth-token"],
    };
    if (!params.uuid || params.uuid == "") {
      logger.error(
        pathName,
        'Logout -Error_Message -validation failed "uuid is required"    :',
        __line
      );
      return res
        .status(400)
        .json({
          status_code: 400,
          status_message: "Invalid parameter or value passed",
        });
    }
    var user = await db.execQuery(
      "SELECT * FROM users WHERE uuid= '" + params.uuid + "'"
    );
    if (user.length > 0) {
      var updatetoken = await db.execQuery(
        "UPDATE users SET is_available = 0,device_token = NULL WHERE uuid='" +
          params.uuid +
          "'"
      );
      console.log(updatetoken);
      if (updatetoken.affectedRows > 0) {
        common.removeJwtAuthToken(
          params.xauthtoken,
          function (err, callbackresult) {
            if (err) {
              console.log(err);
              return res
                .status(200)
                .json({
                  status_code: 200,
                  status_message: "Successfully logged out",
                });
            } else if (callbackresult.status_code == 200) {
              return res
                .status(200)
                .json({
                  status_code: 200,
                  status_message: "Successfully logged out",
                });
            }
          }
        );
      } else {
        return res
          .status(200)
          .json({ status_code: 500, status_message: "Internal Server Error" });
      }
    } else {
      return res
        .status(200)
        .json({ status_code: 404, status_message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server error" });
  }
};
// /**
//  * @swagger
//  * /admin/addAdmin:
//  *   post:
//  *     tags:
//  *       - user
//  *     description: add user as a admin by admin
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     parameters:
//  *       - name: body
//  *         description:  add user as a admin by admin
//  *         in: body
//  *         required: true
//  *         schema:
//  *           type: object
//  *           properties:
//  *             email:
//  *               type: string
//  *             name:
//  *               type: string
//  *             camp_id:
//  *               type: string
//  *             phone:
//  *               type: string
//  *             role_type:
//  *               type: string
//  *             password:
//  *               type: string
//  *     responses:
//  *       201:
//  *         description: admin add successfully
//  *       409:
//  *         description: admin already exist
//  */
// user.addAdmin = async function (req, res) {
// 	logger.info(pathName, 'Add Admin');
// 	try {
// 		if (!req.body.email || common.emailValidation(req.body.email) || (req.body.email && req.body.email.trim() == '')) {
// 			logger.error(pathName, 'admin signup mandatory field email is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required email field for verification" });
// 		}
// 		if (!req.body.phone || common.phoneValidation(req.body.phone) || (req.body.phone && req.body.phone.trim() == '')) {
// 			logger.error(pathName, 'admin signup mandatory field phone is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required phone field for verification" });
// 		}
// 		if (!req.body.camp_id || (req.body.camp_id && req.body.camp_id.trim() == '')) {
// 			logger.error(pathName, 'admin signup mandatory field camp id is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required camp id field." });
// 		}
// 		if (!req.body.role_type) {
// 			logger.error(pathName, 'admin signup mandatory field camp id is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required role_type field." });
// 		}
// 		if (!req.body.password || req.body.password.trim() == '' || !req.body.name || req.body.name.trim() == '') {
// 			logger.error(pathName, 'admin signup mandatory field name/gender is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required name/gender field for verification" });
// 		}
// 		var existCamp = await db.execQuery("SELECT camp_id FROM camp_lists WHERE camp_id = '" + req.body.camp_id + "' AND is_active = 1");
// 		if (existCamp.length <= 0) {
// 			logger.error(pathName, 'invalid camp id:', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for get camp id." });
// 		}
// 		// var isNumber = isNaN(req.body.emailPhone);
// // 		var type = await db.exequery("SELECT module_assign_id FROM module_assign WHERE role = ''");
// // 		if (type.length <= 0) {
// // 			logger.error(pathName, 'check user type exist:', __line);
// // 			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for creating user type." });
// // 		}
// 		// var query;
// 		// if (isNumber) {
// 		var query = "SELECT * FROM users WHERE (email = '" + req.body.email + "' or phone ='" + req.body.phone + "') AND user_type_id NOT in (1,3,4) AND parent_id = 0"
// 		// } else {
// 		// query = "SELECT * FROM users WHERE  phone = '" + req.body.emailPhone + "' AND user_type_id = '" + type[0].module_assign_id + "' AND parent_id = 0"
// 		// }
// 		var existadmin = await db.execQuery(query);
// 		if (existadmin.length > 0) {
// 			logger.error(pathName, 'admin already exist:', __line);
// 			return res.status(200).json({ "status_code": 409, "status_message": "This Email/phone already exist Please try again with another details." });
// 		}
// 		var params = {
// 			uuid: uuidv4(),
// 			is_active: 1,
// 			user_type_id: req.body.role_type,
// 			password:crypto.createHash("md5").update(req.body.password).digest("hex"),
// 			camp_id: req.body.camp_id,
// 			email: req.body.email,
// // 			first_last_name:req.body.first_last_name,
//             // second_last_name:req.body.second_last_name,
//             // date_of_birth:req.body.date_of_birth,
// 			phone: req.body.phone,
// // 			gender: req.body.gender,
// // 			address1: req.body.address1,
// // 			address2: req.body.address2,
// 			name: req.body.name,
// // 			city: req.body.city,
// // 			state: req.body.state
// 		}
// 		var createAdmin = await db.inputQuery('INSERT INTO users SET ?', params);
// 		if (createAdmin) {
// 			res.status(200).json({ "status_code": 201, "status_message": "Patient added successfully", "result": createAdmin });
// 		} else {
// 			res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 		}
// 	} catch (err) {
// 		// in case of error or exception
// 		logger.error(pathName, 'add admin -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }
// /**
//  * @swagger
//  * /admin/getAdminList/:camp_id/:page?/:limit?:
//  *   get:
//  *     tags:
//  *       - user
//  *     description: get admin list based on camp
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     responses:
//  *       200:
//  *         description: get admin list Successfully
//  *       404:
//  *         description: admin list doesn't exist
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  */
// user.getAdminList = async function (req, res) {
// 	logger.info(pathName, 'Get admin List', req.params.camp_id);
// 	try {
// 		var limit = req.params.limit || 20;
// 		var offset = req.params.page > 0 ? req.params.page - 1 : 0;
// // 		var type = await db.exequery("SELECT module_assign_id FROM module_assign WHERE role = 'patient'");
// // 		if (type.length <= 0) {
// // 			logger.error(pathName, 'get Patient list :', __line);
// // 			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for creating user type." });
// // 		}
// 		var query = 'SELECT * FROM users where user_type_id NOT in (1,3,4)';
// 		if (req.params.camp_id && req.params.camp_id.trim() != "0") {
// 			query = query + ' AND camp_id = \'' + req.params.camp_id + '\'';
// 		}
// 		query = query + ' ORDER BY users_id DESC  limit ' + limit + ' offset ' + limit * offset;
// 		var admintlist = await db.execQuery(query);
// 		if (admintlist.length > 0) {
// 			res.status(200).json({ "status_code": 200, "status_message": "Get Admin List successfully", "result": admintlist });
// 		} else {
// 			res.status(200).json({ "status_code": 404, "status_message": "Admin list Doesn't exist" });
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'Get Patient List -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }
module.exports = user;
