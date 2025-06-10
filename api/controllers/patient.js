const config = require("../config/config");
var patient = function () {};
var moment = require("moment-timezone");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var common = require("../controllers/common");
var sgMail = require("../helper/sendemail");
var smsServer = require("../helper/sendSMS");
var logger = require("../middlewares/logger");
var xmlParser = require("xml2json");
const request = require("request");
var db = require("../helper/database");
var uuidv4 = require("uuid/v4");
var pathName = "Patient file";
var oxitone_accesstoken = "46c34ec6-a98a-4d7a-be41-c97e4cb1497a";
var __line;
//   var request = require("request");
var btoa = require("btoa");
// const fetch = require('node-fetch');
var async = require("async");
const { generateUserId } = require("./common");
patient.test1 = async function (req, res) {
  var options = {
    method: "POST",
    url: "https://api.labsmobile.com/json/send",
    headers: {
      "Cache-Control": "no-cache",
      Authorization:
        "Basic " + btoa("bernardoaltamirano@grupomh.mx:Imperia_7220041007721"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Text of the SMS message",
      tpoa: "Sender",
      recipient: [{ msisdn: "523316040725" }],
    }),
  };
  request(options, function (error, response, body) {
    return res.status(200).json({
      status_code: 200,
      status_message: "internal server error",
      result: response,
    });
  });
};

/**
 * @swagger
 * /patient/measurements/:oxitone_id:
 *   get:
 *     tags:
 *       - patient
 *     description: get patient measurements details
 *     responses:
 *       200:
 *         description: get a patient measurements details
 *       404:
 *         description: patient measurements doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
patient.measurements = async function (req, res) {
  async.parallel(
    [
      function (callback) {
        request(
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            url: `https://admedic.oxitone.com/api/v3/provider/records/${req.params.oxitone_id}/measurements/heartrate_streams?start_time=0&end_time=1940&auth_token=${oxitone_accesstoken}`,
            method: "GET",
          },
          async function (err, res2) {
            var data = JSON.parse(xmlParser.toJson(res2.body));
            if (data.errors) {
              return res.status(200).json({
                status_code: 500,
                status_message: "Something went wrong",
              });
            } else {
              return callback(null, data);
            }
          }
        );
      },
      function (callback) {
        request(
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            url: `https://admedic.oxitone.com/api/v3/provider/records/${req.params.oxitone_id}/measurements/oxygen_streams?start_time=0&end_time=1940&auth_token=${oxitone_accesstoken}`,
            method: "GET",
          },
          async function (err, res) {
            var data = JSON.parse(xmlParser.toJson(res.body));
            if (data.errors) {
              return res.status(200).json({
                status_code: 500,
                status_message: "Something went wrong",
              });
            } else {
              return callback(null, data);
            }
          }
        );
      },
      function (callback) {
        request(
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            url: `https://admedic.oxitone.com/api/v3/provider/records/${req.params.oxitone_id}/measurements/temperature_streams?start_time=0&end_time=1940&auth_token=${oxitone_accesstoken}`,
            method: "GET",
          },
          async function (err, res3) {
            var data = JSON.parse(xmlParser.toJson(res3.body));
            if (data.errors) {
              return res.status(200).json({
                status_code: 500,
                status_message: "Something went wrong",
              });
            } else {
              return callback(null, data);
            }
          }
        );
      },
      function (callback) {
        request(
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            url: `https://admedic.oxitone.com/api/v3/provider/records/${req.params.oxitone_id}/measurements/motion_monitorings?start_time=0&end_time=1940&auth_token=${oxitone_accesstoken}`,
            method: "GET",
          },
          async function (err, res4) {
            var data = JSON.parse(xmlParser.toJson(res4.body));
            if (data.errors) {
              return res.status(200).json({
                status_code: 500,
                status_message: "Something went wrong",
              });
            } else {
              return callback(null, data);
            }
          }
        );
      },
    ],
    function (err, result) {
      console.log(err);
      console.log(result);
      if (err) {
        logger.error(
          "api uploadfileonbucketfors1medical Error_Message :-",
          err,
          "  :",
          __line
        );
        console.log(err);
      } else {
        return res.status(200).json({
          status_code: 200,
          status_message: "success",
          result: result,
        });
      }
    }
  );
};

/**
 * @swagger
 * /patient/signUp:
 *   post:
 *     tags:
 *       - patient
 *     description: user signUp as a patient
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: body
 *         description:  user signup as a patient
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             emailPhone:
 *               type: string
 *             camp_id:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       201:
 *         description: patient add successfully
 *       409:
 *         description: patient already exist
 */
patient.signUp = async function (req, res) {
  logger.info(pathName, "Patient signup");
  try {
    if (
      !req.body.emailPhone ||
      (req.body.emailPhone && req.body.emailPhone.trim() == "")
    ) {
      logger.error(
        pathName,
        "patient signup mandatory field email/phone is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Required email/phone field for verification.",
      });
    }
    if (
      !req.body.password ||
      (req.body.password && req.body.password.trim() == "")
    ) {
      logger.error(
        pathName,
        "patient signup mandatory field password is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Required password field for verification.",
      });
    }
    if (
      common.emailValidation(req.body.emailPhone) &&
      common.phoneValidation(req.body.emailPhone)
    ) {
      logger.error(
        pathName,
        "patient signup mandatory field email/phone is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Invalid email/phone. Please check and try again.",
      });
    }
    // 		if (!req.body.camp_id || (req.body.camp_id && req.body.camp_id.trim() == '')) {
    // 			logger.error(pathName, 'patient signup mandatory field hospital id is required :', __line);
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Required hospital id field." });
    // 		}
    if (req.body.camp_id && req.body.camp_id != "") {
      var existCamp = await db.execQuery(
        "SELECT camp_id FROM camp_lists WHERE camp_id = '" +
          req.body.camp_id +
          "' AND is_active = 1"
      );
      if (existCamp.length <= 0) {
        logger.error(pathName, "invalid camp id:", __line);
        return res.status(200).json({
          status_code: 400,
          status_message: "Please contact administrator for get camp id.",
        });
      }
    } else {
      req.body.camp_id = "";
    }

    var isNumber = isNaN(req.body.emailPhone);
    var type = await db.execQuery(
      "SELECT module_assign_id FROM module_assign WHERE role = 'patient'"
    );
    if (type.length <= 0) {
      logger.error(pathName, "check user type exist:", __line);
      return res.status(200).json({
        status_code: 400,
        status_message: "Please contact administrator for creating user type.",
      });
    }
    var query;
    if (isNumber) {
      query =
        "SELECT * FROM users WHERE email = '" +
        req.body.emailPhone +
        "' AND user_type_id = '" +
        type[0].module_assign_id +
        "' AND parent_id = 0";
    } else {
      query =
        "SELECT * FROM users WHERE  phone = '" +
        req.body.emailPhone +
        "' AND user_type_id = '" +
        type[0].module_assign_id +
        "' AND parent_id = 0";
    }
    var existpatient = await db.execQuery(query);
    if (existpatient.length > 0) {
      logger.error(pathName, "Patient already exist:", __line);
      return res.status(200).json({
        status_code: 409,
        status_message:
          "This Email/mobile number already exist Please try again with another details.",
      });
    }

    const uuid = await generateUserId();

    var params = {
      uuid,
      is_active: 1,
      user_type_id: type[0].module_assign_id,
      password: crypto
        .createHash("md5")
        .update(req.body.password)
        .digest("hex"),
      camp_id: req.body.camp_id,
    };
    if (isNumber) {
      params.email = req.body.emailPhone;
    } else {
      params.phone = req.body.emailPhone;
    }
    var createPatient = await db.inputQuery("INSERT INTO users SET ?", params);
    if (createPatient) {
      var patient = await db.execQuery(
        "SELECT * FROM users WHERE users_id = '" + createPatient.insertId + "'"
      );
      if (patient.length > 0) {
        common.getJwtAuthToken(patient[0].uuid, function (err, callbackresult) {
          if (err) {
            res.status(200).json({
              status_code: 401,
              status_message: common.errorGenerateAuthToken,
            });
          } else if (callbackresult.status_code == 200) {
            patient[0].access_token = callbackresult.data.access_token;
            res.status(200).json({
              status_code: 201,
              status_message: "Patient registered successfully.",
              result: patient[0],
            });
          }
        });
        var oxiEmail;
        if (isNumber) {
          oxiEmail = req.body.emailPhone;
        } else {
          oxiEmail = req.body.emailPhone + "@gmail.com";
        }
        request(
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            url: `https://admedic.oxitone.com/api/v3/user/signup?auth_token=${oxitone_accesstoken}&user[email]=${oxiEmail}&user[password]=${req.body.password}&user[units]=metric&user[glucose_units]=mg&category=patient`,
            method: "POST",
          },
          async function (err, res2) {
            var data = JSON.parse(xmlParser.toJson(res2.body));
            if (data.errors) {
            } else {
              console.log(data.patient);
              console.log(data.patient.id);
              var params = {
                oxitone_id: data.patient.id,
              };
              await db.inputQuery(
                "UPDATE users SET ? WHERE uuid ='" + patient[0].uuid + "'",
                params
              );
            }
          }
        );
      } else {
        res
          .status(200)
          .json({ status_code: 500, status_message: "Internal Server Error" });
      }
    } else {
      res
        .status(200)
        .json({ status_code: 500, status_message: "Internal Server Error" });
    }
  } catch (err) {
    // in case of error or exception
    logger.error(pathName, "create patient -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /patient/Search/:page/:limit/:name:
 *   get:
 *     tags:
 *       - patient
 *     description: search a patient by it's name,email or phone in a camp
 *     responses:
 *       200:
 *         description: get a patient list successfully
 *       404:
 *         description: patient doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
patient.search = async function (req, res) {
  var limit = req.params.limit;
  var offset = req.params.page > 0 ? req.params.page - 1 : 0;
  logger.info(pathName, "Patient search");
  // 	if (!req.params.camp_id || req.params.camp_id == '') {
  // 		logger.error(pathName, 'Patient Search mandatory field camp id is required:', __line);
  // 		return res.status(200).json({ "status_code": 400, "status_message": "Hospital id is required." });
  // 	}
  try {
    req.params.name = req.params.name || "";
    var type = await db.execQuery(
      "SELECT module_assign_id FROM module_assign WHERE role = 'patient'"
    );
    if (type.length <= 0) {
      logger.error(pathName, "check user type exist:", __line);
      return res.status(200).json({
        status_code: 400,
        status_message: "Please contact administrator for creating user type.",
      });
    }
    var sql =
      "SELECT * FROM users WHERE user_type_id ='" +
      type[0].module_assign_id +
      "' and ( first_name LIKE '%" +
      req.params.name +
      "%' or last_name LIKE '%" +
      req.params.name +
      "%' or phone LIKE '%" +
      req.params.name +
      "%' or middle_name LIKE '%" +
      req.params.name +
      "%') ORDER BY users_id DESC limit " +
      limit +
      " offset " +
      limit * offset;
    var existPatient = await db.execQuery(sql);
    if (existPatient.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Patient Search Results",
        result: existPatient,
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "There  are no patient available",
      });
    }
  } catch (err) {
    logger.error(pathName, "Patient search -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /patient/updateProfile/:uuid:
 *   put:
 *     tags:
 *       - patient
 *     description: update patient profile
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update patient profile
 *         schema:
 *           type: object
 *           properties:
 *             first_name:
 *               type: string
 *               required: true
 *             image:
 *               type: string
 *               required: true
 *             email:
 *               type: string
 *               required: true
 *             phone:
 *               type: string
 *             date_of_birth:
 *               type: string
 *             gender:
 *               type: string
 *             address1:
 *               type: string
 *             address2:
 *               type: string
 *             landmark:
 *               type: string
 *             allergies:
 *               type: string
 *             medication:
 *               type: string
 *             symptoms:
 *               type: string
 *             bio:
 *               type: string
 *             purpose:
 *               type: string
 *             role:
 *               type: string
 *             last_name:
 *               type: string
 *             middle_name:
 *               type: string
 *             weight:
 *               type: string
 *               required: true
 *             height:
 *               type: string
 *               required: true
 *             country:
 *               type: string
 *             zip_code:
 *               type: string
 *             aadhaar_number:
 *               type: string
 *             city:
 *               type: string
 *             language:
 *               type: string
 *             history_of_genetic:
 *               type: string
 *     responses:
 *       200:
 *         description: update profile succcessfully
 *       500:
 *         description: Internal Server Error
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
patient.updateProfile = async function (req, res) {
  logger.info(pathName, "update Profile", req.body.users_id);
  try {
    req.body.role = 4;
    if (!req.params.uuid || (req.params.uuid && req.params.uuid.trim() == "")) {
      return res.status(200).json({
        status_code: 400,
        status_message: "Unknown user, user id is missing",
      });
    }
    if (
      !req.body.email ||
      (req.body.email && req.body.email.trim() == "") ||
      common.emailValidation(req.body.email)
    ) {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Email is required." });
    }
    if (
      !req.body.phone ||
      (req.body.phone && req.body.phone.trim() == "") ||
      common.phoneValidation(req.body.phone)
    ) {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Phone is required." });
    }
    if (
      !req.body.first_name ||
      (req.body.first_name && req.body.first_name.trim() == "")
    ) {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Name is required." });
    }
    if (
      !req.body.date_of_birth ||
      (req.body.date_of_birth && req.body.date_of_birth.trim() == "")
    ) {
      return res.status(200).json({
        status_code: 400,
        status_message: "Date of birth is required.",
      });
    }
    if (
      !req.body.aadhaar_number ||
      (req.body.aadhaar_number && req.body.aadhaar_number.trim() == "")
    ) {
      return res.status(200).json({
        status_code: 400,
        status_message: "Aadhaar Number is required.",
      });
    }
    if (!req.body.gender || req.body.gender.trim() == "") {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Gender is required." });
    }
    if (!req.body.height || req.body.height.trim() == "") {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Height is required." });
    }
    if (!req.body.weight || req.body.weight.trim() == "") {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Weight is required." });
    }
    // if (!req.body.zip_code || req.body.zip_code.trim() == '') {
    // 	return res.status(200).json({ "status_code": 400, "status_message": "Zip code is required." });
    // }
    // if (!req.body.language || req.body.language.trim() == '') {
    // 	return res.status(200).json({ "status_code": 400, "status_message": "Language is required." });
    // }
    // 		if (!req.body.address1 || req.body.address1.trim() == '') {
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Address1 is required." });
    // 		}
    // 		if (!req.body.allergies || req.body.allergies.trim() == '' || !req.body.medication || req.body.medication.trim() == '') {
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Allergies/Medication is required." });
    // 		}
    // if (!req.body.role) {
    // 	return res.status(200).json({ "status_code": 400, "status_message": "Role is required." });
    // }
    var existuser = await db.execQuery(
      "SELECT users_id,email,phone FROM users WHERE uuid = '" +
        req.params.uuid +
        "' AND user_type_id = '" +
        req.body.role +
        "'"
    );
    if (existuser.length <= 0) {
      logger.error(pathName, "invalid users uuid:");
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Invalid Patient Details." });
    }
    var params = {
      first_name: req.body.first_name,
      image: req.body.image,
      // phone: req.body.phone,
      aadhaar_number: req.body.aadhaar_number,
      // 			email: req.body.email,
      // 			purpose: req.body.purpose,
      city: req.body.city,
      // Changes made on 1 nov
      state: req.body.state,
      //
      gender: req.body.gender,
      allergies: req.body.allergies,
      medication: req.body.medication,
      // 			symptoms: req.body.symptoms,
      bio: req.body.bio,
      date_of_birth: moment(req.body.date_of_birth).format(
        "yyyy-MM-DD HH:mm:ss"
      ),
      address1: req.body.address1,
      address2: req.body.address2,
      // 			landmark: req.body.landmark,
      // history_of_genetic: req.body.history_of_genetic,
      country: req.body.country,
      height: req.body.height ? req.body.height : "0",
      weight: req.body.weight ? req.body.weight : "0",
      last_name: req.body.last_name,
      middle_name: req.body.middle_name,
    };
    if (req.body.zip_code) {
      params.zip_code = req.body.zip_code;
    }
    if (req.body.via_app) {
      if (req.body.via_email) {
        params.phone = req.body.phone;
        var existemail = await db.execQuery(
          "SELECT users_id, uuid,email,phone FROM users WHERE phone = '" +
            params.phone +
            "' AND user_type_id = " +
            req.body.role
        );
        if (existemail.length > 0 && existemail[0].uuid !== req.params.uuid) {
          logger.error(pathName, "invalid users uuid:");
          return res.status(200).json({
            status_code: 409,
            status_message: "Mobile number already exist.",
          });
        }
      } else {
        params.email = req.body.email;
        var existemail = await db.execQuery(
          "SELECT users_id,email,phone FROM users WHERE email = '" +
            params.email +
            "' AND user_type_id = " +
            req.body.role
        );
        // console.log(existemail.length)
        if (existemail.length > 0) {
          logger.error(pathName, "invalid users uuid:");
          //console.log(existemail.length)
          return res
            .status(200)
            .json({ status_code: 409, status_message: "Email already exist." });
        }
      }
    } else {
      if (
        !existuser[0].email ||
        (existuser[0].email && existuser[0].email.trim() == "")
      ) {
        params.email = req.body.email;
      }
      if (
        !existuser[0].phone ||
        (existuser[0].phone && existuser[0].phone.trim() == "")
      ) {
        params.phone = req.body.phone;
      }
      console.log(params.email);
      if (params.email) {
        //  console.log(params.email)
        var existemail = await db.execQuery(
          "SELECT users_id,email,phone FROM users WHERE email = '" +
            params.email +
            "' AND user_type_id = " +
            req.body.role
        );
        // console.log(existemail.length)
        if (existemail.length > 0) {
          logger.error(pathName, "invalid users uuid:");
          //console.log(existemail.length)
          return res
            .status(200)
            .json({ status_code: 409, status_message: "Email already exist." });
        }
      }
      if (params.phone) {
        var existemail = await db.execQuery(
          "SELECT users_id, uuid,email,phone FROM users WHERE phone = '" +
            params.phone +
            "' AND user_type_id = " +
            req.body.role
        );
        if (existemail.length > 0 && existemail[0].uuid !== req.params.uuid) {
          logger.error(pathName, "invalid users uuid:");
          return res.status(200).json({
            status_code: 409,
            status_message: "Mobile number already exist.",
          });
        }
      }
    }
    if (req.body.language) {
      params.language = req.body.language;
      // 			params.image = req.body.image;
    }
    // if (req.body.image) {
    // 	params.image = req.body.image;
    // }

    var updatePatient = await db.inputQuery(
      "UPDATE users SET ? WHERE uuid ='" + req.params.uuid + "'",
      params
    );
    if (updatePatient.affectedRows > 0) {
      var existuser = await db.execQuery(
        "SELECT users_id FROM users WHERE uuid ='" + req.params.uuid + "'"
      );
      if (existuser.length > 0) {
        var activity = {
          name: "Profile updated successfully",
          patient_id: existuser[0].users_id,
        };
        await db.inputQuery("INSERT INTO activity SET ?", activity);
      }
      res.status(200).json({
        status_code: 200,
        status_message: "Profile updated successfully.",
        result: updatePatient,
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "Patient doesn't exist. Please check and try again.",
      });
    }
  } catch (err) {
    logger.error(pathName, "Update Patient Profile -Error :-", err);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

// /**
//  * @swagger
//  * /appointment/schedule:
//  *   post:
//  *     tags:
//  *       - patient
//  *     description: schedule an appointment by patient
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     parameters:
//  *       - in: body
//  *         name: body
//  *         description: schedule an appointment	by patient
//  *         schema:
//  *           type: object
//  *           properties:
//  *             patient_id:
//  *               type: string
//  *             doctor_id:
//  *               type: string
//  *             start_time:
//  *               type: string
//  *             end_time:
//  *               type: string
//  *             date:
//  *               type: string
//  *             appointment_type:
//  *               type: string   * VIDEO_CONSULT/CLINIC_CONSULT *
//  *             device_type:
//  *               type: string   * web/device name *
//  *             symptoms:
//  *               type: string
//  *             allergies:
//  *               type: string
//  *             medications:
//  *               type: string
//  *             accelerometer:
//  *               type: integer
//  *             heart_rate_variation:
//  *               type: integer
//  *             heart_rate:
//  *               type: integer
//  *             oxygen_blood_saturation:
//  *               type: integer
//  *     responses:
//  *       201:
//  *         description:An appointment add successfully
//  *       500:
//  *         description: Internal Server Error
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  */
// patient.schedule = async function (req, res) {
// 	logger.info(pathName, 'schedule appointment', req.body.doctor_id);
// 	try {
// 		if (!req.body.patient_id || req.body.patient_id == '' || !req.body.doctor_id || req.body.doctor_id == '') {
// 			logger.error(pathName, 'schedule appointment mandatory field patient id and doctor id is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "selection of Patient or doctor is missing." });
// 		}
// 		if (!req.body.start_time || req.body.start_time == '' || !req.body.end_time || req.body.end_time == '') {
// 			logger.error(pathName, 'schedule appointment mandatory field Start and End time is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Please select an appointment time." });
// 		}
// 		if (!req.body.date || req.body.date.trim() == '' || !req.body.appointment_type || req.body.appointment_type.trim() == '') {
// 			logger.error(pathName, 'schedule appointment mandatory field is appointment date and type required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Please select an appointment date and appointment type." });
// 		}
// 		if (!req.body.symptoms || req.body.symptoms == '' || !req.body.allergies || req.body.allergies == '' || !req.body.medications || req.body.medications == '') {
// 			logger.error(pathName, 'schedule appointment mandatory field Symptoms/Allergies/Medications is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Symptims,Allergies and medications are missing" });
// 		}
// 		if (!req.body.device_type || req.body.device_type.trim() == '') {
// 			logger.error(pathName, 'schedule appointment mandatory field Device type is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Device Type is missing" });
// 		}
// 		var params = {
// 			patient_id: req.body.patient_id,
// 			device_type: req.body.device_type,
// 			symptoms: req.body.symptoms,
// 			allergies: req.body.allergies,
// 			medications: req.body.medications,
// 			doctor_id: req.body.doctor_id,
// 			call_type: req.body.appointment_type.toLowerCase() == 'video_consult' ? 'VIDEO_CONSULT' : 'CLINIC_CONSULT',
// 			updated_at: moment(new Date()).format("yyyy-MM-DD HH:mm:ss")
// 		}
// 		var createCallId = await db.inupquery('INSERT INTO user_call_logs SET ?', params);

// // 		///////////////////////////////

// // 		var tempdate = moment(new Date("2021-07-17 09:00 pm")).utcOffset('+05:30').format();
// // 		console.log(tempdate);
// // 		//////////////////////////////
// 		if (createCallId) {
// 			var params = {
// 				patient_id: req.body.patient_id,
// 				doctor_id: req.body.doctor_id,
// 				start_time: req.body.start_time,
// 				end_time: req.body.end_time,
// 				status: 'REQUESTED',
// 				date: req.body.date,
// 				appointment_type: req.body.appointment_type,
// 				call_id: createCallId.insertId
// 			}
// 				if(req.body.accelerometer || req.body.heart_rate_variation || req.body.heart_rate || req.body.oxygen_blood_saturation){
// 					var vitals ={
// 						accelerometer: req.body.accelerometer,
// 						heart_rate_variation:req.body.heart_rate_variation,
// 						heart_rate:req.body.heart_rate,
// 						oxygen_blood_saturation:req.body.oxygen_blood_saturation,
// 						patient_id: req.body.patient_id,
// 						call_id:createCallId.insertId
// 				   }
// 				   await db.inupquery('INSERT INTO vitals SET ?', vitals);
// 				}
// 			var schedule = await db.inupquery('INSERT INTO appointments SET ?', params);
// 			if (schedule) {
// 			    var activity={
// 			        name:'Scheduled an appointment',
// 			        patient_id:req.body.patient_id
// 			    }
// 			     await db.inupquery('INSERT INTO activity SET ?', activity);
// 				var existuser = await db.exequery("SELECT * FROM users WHERE users_id = " + req.body.doctor_id);
// 				if (existuser.length > 0) {
// // 			smsServer.messages.create({
// // 				to: "+91" + existuser[0].phone,
// // 				from: config.twilio.smsFrom,
// // 				body: `Cancel your appointment please check details on portal.`
// // 			}, async function (error, successSendsms) {
// // 						console.log(successSendsms);
// // 							console.log(error);
// 			params.date1 =  moment(params.date).format("MMM Do YY ")
// 						var msg = {
// 							from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
// 							to: existuser[0].email,
// 							subject: "Appointment Confirmation",
// 							html: common.scheduleAppointmentTemplate(params)
// 						};
// 						sendEmail = await sgMail.send(msg);
// 						if (sendEmail[0].statusCode == 202) {
// 							return res.status(200).json({ "status_code": 201, "status_message": "Schedule an appointment successfully", "result": { appointment_id: schedule.insertId } });
// 						}
// 						return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 				// 	})
// 				} else {
// 					return res.status(200).json({ "status_code": 201, "status_message": "Schedule an appointment successfully", "result": { appointment_id: schedule.insertId } });
// 				}
// 			} else {
// 				return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 			}
// 		} else {
// 			return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'schedule an Appointment -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }
/**
 * @swagger
 * /appointment/schedule:
 *   post:
 *     tags:
 *       - patient
 *     description: schedule an appointment by patient
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: schedule an appointment	by patient
 *         schema:
 *           type: object
 *           properties:
 *             patient_id:
 *               type: string
 *             agent_id:
 *               type: string
 *             doctor_id:
 *               type: string
 *             start_time:
 *               type: string
 *             end_time:
 *               type: string
 *             date:
 *               type: string
 *             appointment_type:
 *               type: string
 *               example: VIDEO_CONSULT/CLINIC_CONSULT
 *             device_type:
 *               type: string
 *               example:  web/device name
 *             symptoms:
 *               type: string
 *             allergies:
 *               type: string
 *             medications:
 *               type: string
 *             accelerometer:
 *               type: integer
 *             heart_rate_variation:
 *               type: integer
 *             heart_rate:
 *               type: integer
 *             oxygen_blood_saturation:
 *               type: integer
 *     responses:
 *       201:
 *         description:An appointment add successfully
 *       500:
 *         description: Internal Server Error
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
patient.schedule = async function (req, res) {
  logger.info(pathName, "schedule appointment", req.body.doctor_id);
  try {
    if (
      !req.body.patient_id ||
      req.body.patient_id == "" ||
      !req.body.doctor_id ||
      req.body.doctor_id == ""
    ) {
      logger.error(
        pathName,
        "schedule appointment mandatory field patient id and doctor id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Selection of Patient or doctor is missing.",
      });
    }
    if (
      !req.body.start_time ||
      req.body.start_time == "" ||
      !req.body.end_time ||
      req.body.end_time == ""
    ) {
      logger.error(
        pathName,
        "schedule appointment mandatory field Start and End time is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Please select an appointment time.",
      });
    }
    if (
      !req.body.date ||
      req.body.date.trim() == "" ||
      !req.body.appointment_type ||
      req.body.appointment_type.trim() == ""
    ) {
      logger.error(
        pathName,
        "schedule appointment mandatory field is appointment date and type required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message:
          "Please select an appointment date and appointment type.",
      });
    }
    if (
      !req.body.symptoms ||
      req.body.symptoms == "" ||
      !req.body.allergies ||
      req.body.allergies == "" ||
      !req.body.medications ||
      req.body.medications == ""
    ) {
      logger.error(
        pathName,
        "schedule appointment mandatory field Symptoms/Allergies/Medications is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Symptoms ,Allergies and medications are missing.",
      });
    }
    if (!req.body.device_type || req.body.device_type.trim() == "") {
      logger.error(
        pathName,
        "schedule appointment mandatory field Device type is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Device Type is missing." });
    }
    var params = {
      patient_id: req.body.patient_id,
      device_type: req.body.device_type,
      agent_id: req.body.agent_id,
      symptoms: req.body.symptoms,
      allergies: req.body.allergies,
      medications: req.body.medications,
      doctor_id: req.body.doctor_id,
      call_type:
        req.body.appointment_type.toLowerCase() == "video_consult"
          ? "VIDEO_CONSULT"
          : "CLINIC_CONSULT",
      updated_at: moment(new Date()).format("yyyy-MM-DD HH:mm:ss"),
    };

    var createCallId = await db.inputQuery(
      "INSERT INTO user_call_logs SET ?",
      params
    );

    // 		///////////////////////////////

    // 		var tempdate = moment(new Date("2021-07-17 09:00 pm")).utcOffset('+05:30').format();
    // 		console.log(tempdate);
    // 		//////////////////////////////
    if (createCallId) {
      var params = {
        patient_id: req.body.patient_id,
        doctor_id: req.body.doctor_id,
        start_time: req.body.start_time,
        agent_id: req.body.agent_id,
        end_time: req.body.end_time,
        status: "REQUESTED",
        date: req.body.date,
        appointment_type: req.body.appointment_type,
        call_id: createCallId.insertId,
      };
      if (
        req.body.accelerometer ||
        req.body.heart_rate_variation ||
        req.body.heart_rate ||
        req.body.oxygen_blood_saturation
      ) {
        var vitals = {
          accelerometer: req.body.accelerometer,
          heart_rate_variation: req.body.heart_rate_variation,
          heart_rate: req.body.heart_rate,
          oxygen_blood_saturation: req.body.oxygen_blood_saturation,
          patient_id: req.body.patient_id,
          call_id: createCallId.insertId,
        };
        await db.inputQuery("INSERT INTO vitals SET ?", vitals);
      }
      var schedule = await db.inputQuery(
        "INSERT INTO appointments SET ?",
        params
      );
      if (schedule) {
        var activity = {
          name: "Scheduled an appointment",
          patient_id: req.body.patient_id,
        };
        await db.inputQuery("INSERT INTO activity SET ?", activity);

        var existuser = await db.execQuery(
          "SELECT * FROM users WHERE users_id = " + req.body.doctor_id
        );
        var existPatient = await db.execQuery(
          "SELECT first_name FROM users WHERE users_id = " + req.body.patient_id
        );
        params.p_name = existPatient && existPatient[0].first_name;
        if (existuser.length > 0) {
          // 			smsServer.messages.create({
          // 				to: "+91" + existuser[0].phone,
          // 				from: config.twilio.smsFrom,
          // 				body: `Cancel your appointment please check details on portal.`
          // 			}, async function (error, successSendsms) {
          // 						console.log(successSendsms);
          // 							console.log(error);

          var emailtitle = "Appointment Confirmation";
          var emaillang = "en";
          // console.log(existuser[0].app_language)
          if (existuser[0].app_language == "es") {
            emailtitle = "Nueva cita agendada en Dr. LaBike";
            emaillang = "es";
          }

          params.date1 = moment(params.date).format("MMM Do YY ");
          // if(existuser[0].phone && existuser[0].phone!=''){
          var noti_msg = `A patient has booked an appoitment for ${params.date1} at ${params.start_time} for telecall. Please check the appointment list to join the call.`;
          var title = "Appointment schedule";
          if (existuser[0].device_token && existuser[0].device_token != "") {
            common.sendpushnotification(
              existuser[0].device_token,
              noti_msg,
              title
            );
            var notification = {
              title: "Appointment schedule",
              text: `A patient has booked an appoitment for ${params.date1} at ${params.start_time} for telecall. Please check the appointment list to join the call.`,
              doctor_id: req.body.doctor_id,
            };
            await db.inputQuery(
              "INSERT INTO notifications SET ?",
              notification
            );
            //  console.log('doctor 1')
          }

          // 		}
          var msg = {
            from: "Dr. LaBike <" + config.sendgrid.sendgridemail + ">",
            to: existuser[0].email,
            subject: emailtitle,
            html: common.scheduleAppointmentTemplate(params, emaillang),
          };
          sendEmail = await sgMail.send(msg);

          const msgtext = `A patient has booked an appointment for ${params.date1} at ${params.start_time} for telecall. Please check the appointment list to cancel or reschedule the call.`;
          var options = {
            method: "POST",
            url: "https://api.labsmobile.com/json/send",
            headers: {
              "Cache-Control": "no-cache",
              Authorization:
                "Basic " +
                btoa("bernardoaltamirano@grupomh.mx:Imperia_7220041007721"),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: msgtext,
              tpoa: "Sender",
              recipient: [{ msisdn: "91" + existuser[0].phone }],
            }),
          };
          request(options, async function (error, response, body) {
            if (error) {
              return res.status(200).json({
                status_code: 500,
                status_message: "Internal Server Error",
              });
            }
            insertOtp.phone = req.body.phone;
            var insertOtpPhone = await db.inputQuery(
              "INSERT INTO verification_codes SET ?",
              insertOtp
            );
            if (insertOtpPhone) {
              res.status(200).json({
                status_code: 200,
                status_message: "Verification code send successfully",
              });
            } else {
              res.status(200).json({
                status_code: 500,
                status_message: "Internal Server Error",
              });
            }
          });

          // if (sendEmail[0].statusCode == 202) {
          return res.status(200).json({
            status_code: 201,
            status_message: "Appointment scheduled successfully.",
            result: { appointment_id: schedule.insertId },
          });
          // }
          return res.status(200).json({
            status_code: 500,
            status_message: "Internal Server Error",
          });
          // 	})
        } else {
          return res.status(200).json({
            status_code: 201,
            status_message: "Appointment scheduled successfully.",
            result: { appointment_id: schedule.insertId },
          });
        }
      } else {
        return res
          .status(200)
          .json({ status_code: 500, status_message: "Internal Server Error" });
      }
    } else {
      return res
        .status(200)
        .json({ status_code: 500, status_message: "Internal Server Error" });
    }
  } catch (err) {
    logger.error(
      pathName,
      "schedule an Appointment -Error :-",
      err,
      ":",
      __line
    );
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error", err });
  }
};

/**
 * @swagger
 * /appointment/reSchedule:
 *   post:
 *     tags:
 *       - patient
 *     description: Reschedule an appointment
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Reschedule an appointment
 *         schema:
 *           type: object
 *           properties:
 *             start_time:
 *               type: string
 *             end_time:
 *               type: string
 *             date:
 *               type: string
 *             appointment_id:
 *               type: integer
 *     responses:
 *       200:
 *         description: reschedule an appointment successfully
 *       500:
 *         description: Internal Server Error
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
patient.reSchedule = async function (req, res) {
  logger.info(pathName, "reSchedule an appointment", req.body.appointment_id);
  try {
    if (
      !req.body.start_time ||
      req.body.start_time == "" ||
      !req.body.end_time ||
      req.body.end_time == ""
    ) {
      logger.error(
        pathName,
        "reSchedule an appointment mandatory field start and end time is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Please select time for reSchedule appointment.",
      });
    }
    if (!req.body.date || req.body.date.trim() == "") {
      logger.error(
        pathName,
        "reSchedule an appointment mandatory field date is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Appointment date is missing.",
      });
    }
    if (!req.body.appointment_id || req.body.appointment_id == "") {
      logger.error(
        pathName,
        "reSchedule an appointment mandatory field appointment id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message:
          "Appointment id is missing for reSchedule appointment .",
      });
    }
    var params = {
      start_time: req.body.start_time,
      end_time: req.body.end_time,
      status: "REQUESTED",
      date: req.body.date,
    };
    var updatevetAppointment = await db.inputQuery(
      "UPDATE appointments SET ? WHERE id ='" + req.body.appointment_id + "'",
      params
    );
    if (updatevetAppointment.affectedRows > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Appointment rescheduled successfully.",
        result: updatevetAppointment,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 500, status_message: "Internal Server Error" });
    }
  } catch (err) {
    logger.error(
      pathName,
      "reSchedule an appointment -Error :-",
      err,
      ":",
      __line
    );
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

// /**
//  * @swagger
//  * /appointment/cancel:
//  *   post:
//  *     tags:
//  *       - patient
//  *     description: cancel an appointment by doctor
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     parameters:
//  *       - in: body
//  *         name: body
//  *         description: cancel an appointment by doctor
//  *         schema:
//  *           type: object
//  *           properties:
//  *             appointment_id:
//  *               type: string
//  *             cancel_by:
//  *               type: integer
//  *             cancel_on:
//  *               type: integer
//  *     responses:
//  *       200:
//  *         description: cancel an appointment successfully
//  *       404:
//  *         description: An appointment not found for cancel
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  */
// patient.cancel = async function (req, res) {
// 	logger.info(pathName, 'Cancel An Appointment');
// 	try {
// 		if (!req.body.appointment_id || req.body.appointment_id == '') {
// 			logger.error(pathName, 'Cancel an appointment mandatory field appointment id is required:', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Appointment id is missing." });
// 		}
// 		if (!req.body.cancel_by || req.body.cancel_by == '' || !req.body.cancel_on || req.body.cancel_on == '') {
// 			logger.error(pathName, 'Cancel an appointment mandatory field is cancel_by and cancel_on required id:', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Cancel by and cancel on user is missing." });
// 		}
// 		var params = {
// 			status: 'CANCELLED',
// 			cancel_by: req.body.cancel_by
// 		}
// 		var cancelAppointment = await db.inupquery('UPDATE appointments SET ? WHERE id =\'' + req.body.appointment_id + '\'', params);

// 		if (cancelAppointment.affectedRows > 0) {
// 			// return res.status(200).json({ "status_code": 200, "status_message": "Appointment cancelled successfully." });
// 			var existuser = await db.exequery("SELECT * FROM users WHERE users_id = " + req.body.cancel_on);
// 			if (existuser.length > 0) {
// 			     var activity={
// 			        name:'Rescheduled an appointment',
// 			        patient_id:req.body.cancel_by
// 			    }
// 			     await db.inupquery('INSERT INTO activity SET ?', activity);
// 				if (existuser[0].phone) {

// 				    	var options = { method: 'POST',
//   url: 'https://api.labsmobile.com/json/send',
//   headers:
//   { 'Cache-Control': 'no-cache',
//      Authorization: 'Basic ' + btoa("bernardoaltamirano@grupomh.mx:Imperia_7220041007721"),
//      'Content-Type': 'application/json' },
//   body:JSON.stringify({ message: `Your appointment with Doctor has been canceled. If you need more information please contact support to know more about it.`,
//   tpoa: 'Sender',
//   recipient:
//   [{ msisdn: '52'+existuser[0].phone }
//      ] })

// };
// request(options,async function (error, response, body) {
//     if(error){
//         	return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
//     }
// 		return res.status(200).json({ "status_code": 200, "status_message": "Appointment cancelled successfully." });

// 					})
// 				}
// 				if(existuser[0].email) {
// 					var msg = {
// 						from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
// 						to: existuser[0].email,
// 						subject: "Appointment Cancelation Update",
// 						html: common.cancelAppointmentTemplate()
// 					};
// 					sendEmail = await sgMail.send(msg);
// 					if (sendEmail[0].statusCode == 202) {
// 						return res.status(200).json({ "status_code": 200, "status_message": "Appointment cancelled successfully." });

// 					} else {
// 						res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 					}

// 				}

// 			} else {
// 				res.status(200).json({ "status_code": 200, "status_message": "Appointment cancelled successfully." });
// 			}
// 		} else {
// 			return res.status(200).json({ "status_code": 404, "status_message": "Appointment not available for cancel" });
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'Cancel an appointment -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal server error" });
// 	}
// }

/**
 * @swagger
 * /appointment/cancel:
 *   post:
 *     tags:
 *       - patient
 *     description: cancel an appointment by doctor
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: cancel an appointment by doctor
 *         schema:
 *           type: object
 *           properties:
 *             appointment_id:
 *               type: string
 *             cancel_by:
 *               type: integer
 *             cancel_on:
 *               type: integer
 *     responses:
 *       200:
 *         description: cancel an appointment successfully
 *       404:
 *         description: An appointment not found for cancel
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
patient.cancel = async function (req, res) {
  logger.info(pathName, "Cancel An Appointment");
  try {
    if (!req.body.appointment_id || req.body.appointment_id == "") {
      logger.error(
        pathName,
        "Cancel an appointment mandatory field appointment id is required:",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Appointment id is missing.",
      });
    }
    if (
      !req.body.cancel_by ||
      req.body.cancel_by == "" ||
      !req.body.cancel_on ||
      req.body.cancel_on == ""
    ) {
      logger.error(
        pathName,
        "Cancel an appointment mandatory field is cancel_by and cancel_on required id:",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Cancel by and cancel on user is missing.",
      });
    }
    var params = {
      status: "CANCELLED",
      cancel_by: req.body.cancel_by,
    };
    var cancelAppointment = await db.inputQuery(
      "UPDATE appointments SET ? WHERE id ='" + req.body.appointment_id + "'",
      params
    );

    if (cancelAppointment.affectedRows > 0) {
      // return res.status(200).json({ "status_code": 200, "status_message": "Appointment cancelled successfully." });
      var existuser = await db.execQuery(
        "SELECT * FROM users WHERE users_id = " + req.body.cancel_on
      );
      var existdoctor = await db.execQuery(
        "SELECT first_name FROM users WHERE users_id = " + req.body.cancel_by
      );

      if (existuser.length > 0) {
        var emailparams = {
          p_name: existuser[0].first_name,
          d_name: existdoctor[0].first_name,
        };
        var emailtitle = "Appointment Cancellation Update";
        var emaillang = "en";
        if (existuser[0].app_language == "es") {
          emailtitle = "Tu cita en Dr. LaBike ha sido cancelada";
          emaillang = "es";
        }

        var activity = {
          name: "Cancelled an appointment",
          patient_id: req.body.cancel_by,
        };
        await db.inputQuery("INSERT INTO activity SET ?", activity);
        if (existuser[0].phone) {
          // 	if(existuser[0].phone && existuser[0].phone!=''){
          var noti_msg = `Your appointment with Doctor has been cancelled. If you need more information please contact support to know more about it.`;
          var title = "Cancelled Appointment notification";
          if (existuser[0].device_token && existuser[0].device_token != "") {
            common.sendpushnotification(
              existuser[0].device_token,
              noti_msg,
              title
            );
            var notification = {
              title: "Cancelled Appointment notification",
              text: `Your appointment with Doctor has been cancelled. If you need more information please contact support to know more about it.`,
              doctor_id: req.body.cancel_by,
            };
            await db.inputQuery(
              "INSERT INTO notifications SET ?",
              notification
            );
            //  console.log('doctor 1')
          }

          // 		}

          var options = {
            method: "POST",
            url: "https://api.labsmobile.com/json/send",
            headers: {
              "Cache-Control": "no-cache",
              Authorization:
                "Basic " +
                btoa("bernardoaltamirano@grupomh.mx:Imperia_7220041007721"),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: `Your appointment with Doctor has been cancelled. If you need more information please contact support to know more about it.`,
              tpoa: "Sender",
              recipient: [{ msisdn: "91" + existuser[0].phone }],
            }),
          };
          request(options, async function (error, response, body) {
            if (error) {
              return res.status(200).json({
                status_code: 500,
                status_message: "Internal Server Error",
              });
            }
            var msg = {
              from: "Dr. LaBike <" + config.sendgrid.sendgridemail + ">",
              to: existuser[0].email,
              subject: emailtitle,
              html: common.cancelAppointmentTemplate(emaillang, emailparams),
            };
            sendEmail = await sgMail.send(msg);
            // 	if (sendEmail[0].statusCode == 202) {
            // 		return res.status(200).json({ "status_code": 200, "status_message": "Appointment cancelled successfully." });

            // 	}
            return res.status(200).json({
              status_code: 200,
              status_message: "Appointment cancelled successfully.",
            });
          });
        } else {
          var noti_msg = `Your appointment with Doctor has been cancelled. If you need more information please contact support to know more about it.`;
          var title = "Cancelled Appointment notification";
          if (existuser[0].device_token && existuser[0].device_token != "") {
            common.sendpushnotification(
              existuser[0].device_token,
              noti_msg,
              title
            );
            var notification = {
              title: "Cancelled Appointment notification",
              text: `Your appointment with Doctor has been cancelled. If you need more information please contact support to know more about it.`,
              doctor_id: req.body.cancel_by,
            };
            await db.inputQuery(
              "INSERT INTO notifications SET ?",
              notification
            );
            //  console.log('doctor 1')
          }
          var msg = {
            from: "Dr. LaBike <" + config.sendgrid.sendgridemail + ">",
            to: existuser[0].email,
            subject: emailtitle,
            html: common.cancelAppointmentTemplate(emaillang, emailparams),
          };
          sendEmail = await sgMail.send(msg);
          if (sendEmail[0].statusCode == 202) {
            return res.status(200).json({
              status_code: 200,
              status_message: "Appointment cancelled successfully.",
            });
          } else {
            res.status(200).json({
              status_code: 500,
              status_message: "Internal Server Error",
            });
          }
        }
      } else {
        res.status(200).json({
          status_code: 200,
          status_message: "Appointment cancelled successfully.",
        });
      }
    } else {
      return res.status(200).json({
        status_code: 404,
        status_message: "Appointment not available for cancel",
      });
    }
  } catch (err) {
    logger.error(pathName, "Cancel an appointment -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal server error" });
  }
};
// /**
//  * @swagger
//  * /patient/appointment/upcoming/:patient_id/:page/:limit:
//  *   get:
//  *     tags:
//  *       - patient
//  *     description: Return all upcoming appointment by patient id
//  *
//  *     parameters:
//  *       - name: id
//  *         description: patient id
//  *         in: path
//  *         required: true
//  *         type: integer
//  *     responses:
//  *       200:
//  *         description: All upcoming appointments list
//  *       404:
//  *         description: Appointment list doesn't exist
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  *
//  */
// patient.upcomingAppointments = async function (req, res) {
// 	logger.info(pathName, 'Upcoming Appointments patient id ', req.params.patient_id);
// 	if (!req.params.patient_id || req.params.patient_id == '') {
// 		logger.error(pathName, 'Upcoming Appointments mandatory field patient id is required:', __line);
// 		return res.status(200).json({ "status_code": 400, "status_message": "Patient id is missing for get upcoming appointment." });
// 	}

// 	try {
// 		var limit = req.params.limit || 20;
// 		var offset = req.params.page > 0 ? req.params.page - 1 : 0;
// 		var appointmentDetails = await db.exequery("SELECT appointments.*,users.*,user_call_logs.* FROM appointments LEFT JOIN users ON appointments.doctor_id = users.users_id LEFT JOIN user_call_logs ON appointments.call_id = user_call_logs.id where  date >  NOW() AND user_call_logs.video_connect !=1 AND appointments.patient_id ='" + req.params.patient_id + "' ORDER BY appointments.date DESC limit " + limit + " offset " + limit * offset);
// 		if (appointmentDetails.length > 0) {
// 			return res.status(200).json({ "status_code": 200, "status_message": "All Upcoming appointments", "result": appointmentDetails });
// 		} else {
// 			return res.status(200).json({ "status_code": 404, "status_message": "No upcoming appointments found" });
// 		}

// 	} catch (err) {
// 		logger.error(pathName, 'Upcoming Appointments by Patient -Error :-', err, ':', __line);
// 		return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }

// /**
//  * @swagger
//  * /patient/appointment/past/:patient_id/:page/:limit:
//  *   get:
//  *     tags:
//  *       - patient
//  *     description: Return all past appointment by patient id
//  *
//  *     parameters:
//  *       - name: id
//  *         description: patient id
//  *         in: path
//  *         required: true
//  *         type: integer
//  *     responses:
//  *       200:
//  *         description: All past appointments list	by a patient
//  *       404:
//  *         description: Appointments list doesn't exist
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  *
//  */
// patient.pastAppointments = async function (req, res) {
// 	logger.info(pathName, 'Past Appointments patient id', req.params.patient_id);
// 	if (!req.params.patient_id || req.params.patient_id == '') {
// 		logger.error(pathName, 'Past Appointments mandatory field id is required:', __line);
// 		return res.status(200).json({ "status_code": 400, "status_message": "Patient id is missing for get past appointment." });
// 	}
// 	try {
// 		var limit = req.params.limit;
// 		var offset = req.params.page > 0 ? req.params.page - 1 : 0;
// 		var appointmentDetails = await db.exequery("SELECT user_call_logs.id as call_id,user_call_logs.*,users.title,users.name,users.image,users.email,users.phone,users.education_details,appointments.status,vitals.oxygen_blood_saturation,vitals.heart_rate,vitals.heart_rate_variation,vitals.accelerometer FROM user_call_logs LEFT JOIN users ON user_call_logs.doctor_id = users.users_id LEFT JOIN vitals ON user_call_logs.id = vitals.call_id LEFT JOIN appointments ON user_call_logs.id = appointments.call_id where (user_call_logs.video_connect =1 OR (appointments.status = 'CANCELLED' AND appointments.date <  NOW()) ) AND user_call_logs.patient_id =" + req.params.patient_id + " ORDER BY user_call_logs.created_at DESC limit " + limit + " offset " + limit * offset);

// 		if (appointmentDetails.length > 0) {
// 			res.status(200).json({ "status_code": 200, "status_message": "All past appointment List", "result": appointmentDetails });
// 		} else {
// 		} else {
// 			res.status(200).json({ "status_code": 404, "status_message": "No past appointments found" });
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'Past Appointments -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }

/**
 * @swagger
 * /patient/appointment/upcoming/:patient_id/:page/:limit:
 *   get:
 *     tags:
 *       - patient
 *     description: Return all upcoming appointment by patient id
 *
 *     parameters:
 *       - name: id
 *         description: patient id
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
patient.upcomingAppointments = async function (req, res) {
  logger.info(
    pathName,
    "Upcoming Appointments patient id ",
    req.params.patient_id
  );
  if (!req.params.patient_id || req.params.patient_id == "") {
    logger.error(
      pathName,
      "Upcoming Appointments mandatory field patient id is required:",
      __line
    );
    return res.status(200).json({
      status_code: 400,
      status_message: "Patient id is missing for get upcoming appointment.",
    });
  }

  try {
    var limit = req.params.limit || 20;
    var offset = req.params.page > 0 ? req.params.page - 1 : 0;

    const now = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss");

    var appointmentDetails = await db.execQuery(
      "SELECT user_call_logs.id as call_id, user_call_logs.doctor_id as call_doc_id,vitals.id as vital_id, vitals.doctor_id as vital_doc_id, vitals.*, appointments.id as appointment_id,appointments.*,users.symptoms as u_symp, users.allergies as u_aller, users.*,user_call_logs.symptoms as symptoms,user_call_logs.allergies as allergies, user_call_logs.* FROM appointments LEFT JOIN users ON appointments.doctor_id = users.users_id LEFT JOIN vitals ON appointments.call_id = vitals.call_id LEFT JOIN user_call_logs ON appointments.call_id = user_call_logs.id where DATE_ADD(appointments.date, INTERVAL '05:00' HOUR_SECOND) > '" +
        now +
        "' AND user_call_logs.video_connect !=1 AND appointments.patient_id ='" +
        req.params.patient_id +
        "' ORDER BY appointments.date ASC limit " +
        limit +
        " offset " +
        limit * offset
    );

    // Before copying from deshclinic
    // var appointmentDetails = await db.execQuery("SELECT user_call_logs.id as call_id, user_call_logs.doctor_id as call_doc_id, user_call_logs.*,vitals.id as vital_id, vitals.doctor_id as vital_doc_id, vitals.*, appointments.*,users.* FROM appointments LEFT JOIN users ON appointments.doctor_id = users.users_id LEFT JOIN vitals ON appointments.call_id = vitals.call_id LEFT JOIN user_call_logs ON appointments.call_id = user_call_logs.id where  date >  NOW() AND user_call_logs.video_connect !=1 AND appointments.patient_id ='" + req.params.patient_id + "' ORDER BY appointments.date ASC limit " + limit + " offset " + limit * offset);
    if (appointmentDetails.length > 0) {
      return res.status(200).json({
        status_code: 200,
        status_message: "All Upcoming appointments.",
        result: appointmentDetails,
      });
    } else {
      return res.status(200).json({
        status_code: 404,
        status_message: "No upcoming appointments found.",
      });
    }
  } catch (err) {
    logger.error(
      pathName,
      "Upcoming Appointments by Patient -Error :-",
      err,
      ":",
      __line
    );
    return res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /patient/appointment/past/:patient_id/:page/:limit:
 *   get:
 *     tags:
 *       - patient
 *     description: Return all past appointment by patient id
 *
 *     parameters:
 *       - name: id
 *         description: patient id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: All past appointments list	by a patient
 *       404:
 *         description: Appointments list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
patient.pastAppointments = async function (req, res) {
  logger.info(pathName, "Past Appointments patient id", req.params.patient_id);
  if (!req.params.patient_id || req.params.patient_id == "") {
    logger.error(
      pathName,
      "Past Appointments mandatory field id is required:",
      __line
    );
    return res.status(200).json({
      status_code: 400,
      status_message: "Patient id is missing for get past appointment.",
    });
  }
  try {
    var limit = req.params.limit;
    var offset = req.params.page > 0 ? req.params.page - 1 : 0;
    var appointmentDetails = await db.execQuery(
      "SELECT user_call_logs.id as call_id,user_call_logs.*,users.title,users.first_name,users.last_name,users.image,users.email,users.gender,users.phone,users.education_details,appointments.status,vitals.oxygen_blood_saturation,vitals.heart_rate,vitals.heart_rate_variation,vitals.accelerometer FROM user_call_logs LEFT JOIN users ON user_call_logs.doctor_id = users.users_id LEFT JOIN vitals ON user_call_logs.id = vitals.call_id LEFT JOIN appointments ON user_call_logs.id = appointments.call_id where (user_call_logs.video_connect =1 ) AND user_call_logs.patient_id =" +
        req.params.patient_id +
        " ORDER BY user_call_logs.created_at DESC limit " +
        limit +
        " offset " +
        limit * offset
    );

    if (appointmentDetails.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "All past appointment List",
        result: appointmentDetails,
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "No past appointments found",
      });
    }
  } catch (err) {
    logger.error(pathName, "Past Appointments -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error", err });
  }
};

// /**
//  * @swagger
//  * /patient/makeCall:
//  *   post:
//  *     tags:
//  *       - patient
//  *     description: patient make a call
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     parameters:
//  *       - in: body
//  *         name: body
//  *         description: join call by atient.
//  *         schema:
//  *           type: object
//  *           properties:
//  *             patient_id:
//  *               type: integer
//  *             device_type:
//  *               type: string
//  *             symptoms:
//  *               type: string
//  *             allergies:
//  *               type: string
//  *             medications:
//  *               type: string
//  *             doctor_id:
//  *               type: integer
//  *             accelerometer:
//  *               type: integer
//  *             heart_rate_variation:
//  *               type: integer
//  *             heart_rate:
//  *               type: integer
//  *             oxygen_blood_saturation:
//  *               type: integer
//  *             chanel_name:
//  *               type: String
//  *             document_url:
//  *               type: String
//  *     responses:
//  *       200:
//  *         description: patient create call connection successfully
//  *       500:
//  *         description: Internal Server Error
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  */
// patient.makeCall = async function (req, res) {
// 	logger.info(pathName, 'makeCall patient_id', req.body.patient_id);
// 	try {
// 		if (!req.body.patient_id || req.body.patient_id == '') {
// 			logger.error(pathName, 'makeCall mandatory field patient is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Patient is required for schedule a call." });
// 		}
// 		if (!req.body.doctor_id  || req.body.doctor_id == '') {
// 			logger.error(pathName, 'makeCall mandatory field doctor is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Doctor is required for schedule a call." });
// 		}
// 		if (!req.body.device_type  || req.body.device_type == '') {
// 			logger.error(pathName, 'makeCall mandatory field device_type is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "device_type is required for schedule a call." });
// 		}
// 		if (!req.body.chanel_name  || req.body.chanel_name == '') {
// 			logger.error(pathName, 'makeCall mandatory field chanel_name is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "chanel_name is required for schedule a call." });
// 		}
// 		var recordexist = await db.exequery("SELECT * FROM waiting_rooms WHERE patient_id = '" + req.body.patient_id + "'");
// 		req.body.allergies = req.body.allergies ? req.body.allergies : '';
// 		req.body.medications = req.body.medications ? req.body.medications : '';
// 		req.body.symptoms = req.body.symptoms ? req.body.symptoms : '';
// 		common.getOpenTokCallback(async function (err, opentok) {
// 			if (err) {
// 				return res.status(500).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 			}
// 			if (opentok.status_code == 200) {
// 				var params = {
// 					patient_id: req.body.patient_id,
// 					device_type: req.body.device_type,
// 					symptoms: req.body.symptoms,
// 					allergies: req.body.allergies,
// 					medications: req.body.medications,
// 					doctor_id: req.body.doctor_id,
// 				// 	token:  opentok.result.token,
// 				// 	session:  opentok.result.session,
// 					chanel_name :req.body.chanel_name,
// 					// reports_image: req.body.reportsImage,
// 					// dewormed: req.body.dewormed,
// 					video_connect: 1,
// 					// sterlized: req.body.sterlized,
// 					// sterlized_text: req.body.sterlizedText,
// 					patient_connected_at: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
// 				}

// 				var createCallId = await db.inupquery('INSERT INTO user_call_logs SET ?', params);
// 				if (createCallId) {
// 				var waitingparams = {
// 						patient_id: req.body.patient_id,
// 						symptoms: req.body.symptoms,
// 						allergies: req.body.allergies,
// 						medications: req.body.medications,
// 						doctor_id: req.body.doctor_id,
// 						chanel_name :req.body.chanel_name,
// 				// 		token: opentok.result.token,
// 						// remarks: req.body.remarks,
// 				// 		session: opentok.result.session,
// 						checked_in: params.patient_connected_at,
// 						status: 'WAITING',
// 						call_id: createCallId.insertId
// 					}
// 				if(req.body.accelerometer || req.body.heart_rate_variation || req.body.heart_rate || req.body.oxygen_blood_saturation){
// 					var vitals ={
// 						accelerometer: req.body.accelerometer,
// 						heart_rate_variation:req.body.heart_rate_variation,
// 						heart_rate:req.body.heart_rate,
// 						oxygen_blood_saturation:req.body.oxygen_blood_saturation,
// 						patient_id: req.body.patient_id,
// 						call_id:createCallId.insertId
// 				   }
// 				   await db.inupquery('INSERT INTO vitals SET ?', vitals);
// 				}

// 					 var activity = {
// 						      name:'Doctor Consultation',
// 						      patient_id:req.body.patient_id
// 						  }
// 				var doctoruser =  await db.exequery('SELECT email,name  FROM users  where users_id = \'' + req.body.doctor_id + '\'');
// 					if (recordexist.length > 0) {
// 						var updatewaitingroom = await db.inupquery('UPDATE waiting_rooms SET ? WHERE patient_id =\'' + req.body.patient_id + '\'', waitingparams);
// 						if (updatewaitingroom.affectedRows > 0) {
// 						    await db.inupquery('INSERT INTO activity SET ?', activity);

// 			var msg = {
// 				from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
// 				to: doctoruser[0].email,
// 				subject: "Patient Check-In",
// 				html: common.patientCheckingNotify({name:doctoruser[0].name})
// 			};
// 			var sendEmail = await sgMail.send(msg);
// 			if (sendEmail[0].statusCode == 202) {
// 				res.status(200).json({ "status_code": 200, "status_message": "Call add in waiting room successfully", result: waitingparams});
// 			} else {
// 				res.status(200).json({ "status_code": 200, "status_message": "Call add in waiting room successfully", result: waitingparams});
// 			}
// 						} else {
// 							res.status(200).json({ "status_code": 500, "status_message": "internal server error" });
// 						}
// 					} else {
// 						var createWaitingCall = await db.inupquery('INSERT INTO waiting_rooms SET ?', waitingparams);
// 						if (createWaitingCall) {
// 						    await db.inupquery('INSERT INTO activity SET ?', activity);
// 						    var msg = {
// 				from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
// 				to: doctoruser[0].email,
// 				subject: "Patient Check-In",
// 				html: common.patientCheckingNotify({name:doctoruser[0].name})
// 			};
// 			var sendEmail = await sgMail.send(msg);
// 			if (sendEmail[0].statusCode == 202) {
// 				res.status(200).json({ "status_code": 200, "status_message": "Call add in waiting room successfully", result:waitingparams });
// 			} else {
// 				res.status(200).json({ "status_code": 200, "status_message": "Call add in waiting room successfully", result:waitingparams });
// 			}

// 						} else {
// 							res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 						}
// 					}
// 				} else {
// 					res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 				}
// 			}
// 		})

// 	} catch (err) {
// 		logger.error(pathName, 'makeCall -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }

// /**
//  * @swagger
//  * /patient/appointment/makeCall:
//  *   post:
//  *     tags:
//  *       - patient
//  *     description: patient make a call in appointment case
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     parameters:
//  *       - in: body
//  *         name: body
//  *         description: pet make a call in appointment case
//  *         schema:
//  *           type: object
//  *           properties:
//  *             patient_id:
//  *               type: integer
//  *             symptoms:
//  *               type: string
//  *             allergies:
//  *               type: string
//  *             medications:
//  *               type: string
//  *             doctor_id:
//  *               type: integer
//  *             channel_name:
//  *               type: string
//  *             call_id:
//  *               type: integer

//  *     responses:
//  *       200:
//  *         description: patient call successfully
//  *       500:
//  *         description: internal server error
//  */
// patient.appointmentMakeCall = async function (req, res) {
// 	logger.info(pathName, 'appointmentMakeCall ', req.body.patient_id);
// 	try {
// 		if (!req.body.patient_id  || req.body.patient_id == '') {
// 			logger.error(pathName, 'appointmentMakeCall mandatory field is patient id required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Patient details are missing." });
// 		}
// 		console.log(req.body.doctor_id);
// 		if (!req.body.doctor_id  || req.body.doctor_id == '') {
// 			logger.error(pathName, 'appointmentMakeCall mandatory field dactor id is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Doctor details is missing" });
// 		}
// 		if (!req.body.call_id  || req.body.call_id == '') {
// 			logger.error(pathName, 'appointmentMakeCall mandatory field call id  is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Call details is missing." });
// 		}
// 		if (!req.body.channel_name  || req.body.channel_name == '') {
// 			logger.error(pathName, 'appointmentMakeCall mandatory field channel name is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Channel name is missing for video call." });
// 		}
// 		var petRecordexist = await db.exequery("SELECT * FROM waiting_rooms WHERE patient_id = '" + req.body.patient_id + "'");
// 		var waitingparams = {
// 			patient_id: req.body.patient_id,
// 			symptoms: req.body.symptoms,
// 			allergies: req.body.allergies,
// 			medications: req.body.medications,
// 			doctor_id: req.body.doctor_id,
// // 			remarks: req.body.remarks ? req.body.remarks : '',
// 			chanel_name: req.body.channel_name,
// 			checked_in: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
// 			status: 'WAITING',
// 			call_id: req.body.call_id
// 		}
// 		 var activity = {
// 						      name:'Doctor Consultation',
// 						      patient_id:req.body.patient_id
// 						  }
// 		var doctoruser =  await db.exequery('SELECT email,name  FROM users  where users_id = \'' + req.body.doctor_id + '\'');
// 		if (petRecordexist.length > 0) {
// 			var updatevetAppointment = await db.inupquery('UPDATE waiting_rooms SET ? WHERE patient_id =\'' + req.body.patient_id + '\'', waitingparams);
// 			if (updatevetAppointment.affectedRows > 0) {
// 				var callLogsUpdate = await db.inupquery('UPDATE user_call_logs SET video_connect = 1 WHERE id =\'' + req.body.call_id + '\'');
// 				if (callLogsUpdate.affectedRows > 0) {
// 				     await db.inupquery('INSERT INTO activity SET ?', activity);
// 			var msg = {
// 				from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
// 				to:doctoruser[0].email,
// 				subject: "Patient Check-In",
// 				html: common.patientCheckingNotify({name:doctoruser[0].name})
// 			};
// 			var sendEmail = await sgMail.send(msg);
// 			if (sendEmail[0].statusCode == 202) {
// 				res.status(200).json({ "status_code": 200, "status_message": "Schedule a call by patient", result: { call_id: req.body.callId } });
// 			} else {
// 			res.status(200).json({ "status_code": 200, "status_message": "Schedule a call by patient", result: { call_id: req.body.callId } });
// 			}

// 				} else {
// 					res.status(200).json({ "status_code": 500, "status_message": "internal server error" });
// 				}
// 			} else {
// 				res.status(200).json({ "status_code": 500, "status_message": "internal server error" });
// 			}
// 		} else {
// 			var createWaitingCall = await db.inupquery('INSERT INTO waiting_rooms SET ?', waitingparams);
// 			if (createWaitingCall) {
// 				var callLogsUpdate = await db.inupquery('UPDATE user_call_logs SET video_connect = 1 WHERE id =\'' + req.body.call_id + '\'');
// 				if (callLogsUpdate.affectedRows > 0) {
// 				     await db.inupquery('INSERT INTO activity SET ?', activity);
// 			var msg = {
// 				from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
// 				to: doctoruser[0].email,
// 				subject: "Patient Check-In",
// 				html: common.patientCheckingNotify({name:doctoruser[0].name})
// 			};
// 			var sendEmail = await sgMail.send(msg);
// 			if (sendEmail[0].statusCode == 202) {
// 				res.status(200).json({ "status_code": 200, "status_message": "Schedule a call by patient", result: { call_id: req.body.callId } });
// 			} else {
// 		res.status(200).json({ "status_code": 200, "status_message": "Schedule a call by patient", result: { call_id: req.body.callId } });
// 			}

// 				} else {
// 					res.status(200).json({ "status_code": 500, "status_message": "internal server error" });
// 				}
// 			} else {
// 				res.status(200).json({ "status_code": 500, "status_message": "internal server error" });
// 			}
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'appointmentMakeCall -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "internal server error" });
// 	}

// }
/**
 * @swagger
 * /patient/makeCall:
 *   post:
 *     tags:
 *       - patient
 *     description: patient make a call
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: join call by atient.
 *         schema:
 *           type: object
 *           properties:
 *             patient_id:
 *               type: integer
 *             agent_id:
 *               type: integer
 *             device_type:
 *               type: string
 *             symptoms:
 *               type: string
 *             allergies:
 *               type: string
 *             medications:
 *               type: string
 *             doctor_id:
 *               type: integer
 *             accelerometer:
 *               type: integer
 *             heart_rate_variation:
 *               type: integer
 *             heart_rate:
 *               type: integer
 *             oxygen_blood_saturation:
 *               type: integer
 *             chanel_name:
 *               type: String
 *             document_url:
 *               type: String
 *     responses:
 *       200:
 *         description: patient create call connection successfully
 *       500:
 *         description: Internal Server Error
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
patient.makeCall = async function (req, res) {
  logger.info(pathName, "makeCall patient_id", req.body.patient_id);
  logger.info(pathName, "makeCall body check", req.body);
  console.log(pathName, "makeCall body check", req.body);
  try {
    if (!req.body.patient_id || req.body.patient_id == "") {
      logger.error(pathName, "makeCall mandatory field patient is required :");
      return res.status(200).json({
        status_code: 400,
        status_message: "Patient is required for schedule a call.",
      });
    }
    if (!req.body.doctor_id || req.body.doctor_id == "") {
      logger.error(pathName, "makeCall mandatory field doctor is required :");
      return res.status(200).json({
        status_code: 400,
        status_message: "Doctor is required for schedule a call.",
      });
    }
    if (!req.body.device_type || req.body.device_type == "") {
      logger.error(
        pathName,
        "makeCall mandatory field device_type is required :"
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "device_type is required for schedule a call.",
      });
    }
    if (!req.body.chanel_name || req.body.chanel_name == "") {
      logger.error(
        pathName,
        "makeCall mandatory field chanel_name is required :"
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "chanel_name is required for schedule a call.",
      });
    }
    if (
      !req.body.symptoms ||
      req.body.symptoms == "" ||
      !req.body.allergies ||
      req.body.allergies == "" ||
      !req.body.medications ||
      req.body.medications == ""
    ) {
      logger.error(
        pathName,
        "schedule appointment mandatory field Symptoms/Allergies/Medications is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Symptoms ,Allergies and medications are missing.",
      });
    }
    var recordexist = await db.execQuery(
      "SELECT * FROM waiting_rooms WHERE patient_id = '" +
        req.body.patient_id +
        "'"
    );
    req.body.allergies = req.body.allergies ? req.body.allergies : "";
    req.body.medications = req.body.medications ? req.body.medications : "";
    req.body.symptoms = req.body.symptoms ? req.body.symptoms : "";
    common.getOpenTokCallback(async function (err, opentok) {
      if (err) {
        return res
          .status(500)
          .json({ status_code: 500, status_message: "Internal Server Error" });
      }
      if (opentok.status_code == 200) {
        var params = {
          patient_id: req.body.patient_id,
          device_type: req.body.device_type,
          symptoms: req.body.symptoms,
          agent_id: req.body.agent_id,
          allergies: req.body.allergies,
          medications: req.body.medications,
          doctor_id: req.body.doctor_id,
          check_Type: req.body.callType,
          // 	token:  opentok.result.token,
          // 	session:  opentok.result.session,
          chanel_name: req.body.chanel_name,
          // reports_image: req.body.reportsImage,
          // dewormed: req.body.dewormed,
          video_connect: 1,
          // sterlized: req.body.sterlized,
          // sterlized_text: req.body.sterlizedText,
          patient_connected_at: moment()
            .tz("Asia/Kolkata")
            .format("YYYY-MM-DD HH:mm:ss"),
        };

        var createCallId = await db.inputQuery(
          "INSERT INTO user_call_logs SET ?",
          params
        );
        if (createCallId) {
          var waitingparams = {
            patient_id: req.body.patient_id,
            symptoms: req.body.symptoms,
            allergies: req.body.allergies,
            medications: req.body.medications,
            agent_id: req.body.agent_id,
            doctor_id: req.body.doctor_id,
            chanel_name: req.body.chanel_name,
            check_Type: req.body.callType,
            // 		token: opentok.result.token,
            // remarks: req.body.remarks,
            // 		session: opentok.result.session,
            checked_in: params.patient_connected_at,
            status: "WAITING",
            call_id: createCallId.insertId,
          };
          var noti_msg =
            "A patient has checked in for an instant call, please look into your call queue.";
          var title = "Patient Check-In";
          if (
            req.body.accelerometer ||
            req.body.heart_rate_variation ||
            req.body.heart_rate ||
            req.body.oxygen_blood_saturation
          ) {
            var vitals = {
              accelerometer: req.body.accelerometer,
              heart_rate_variation: req.body.heart_rate_variation,
              heart_rate: req.body.heart_rate,
              oxygen_blood_saturation: req.body.oxygen_blood_saturation,
              patient_id: req.body.patient_id,
              call_id: createCallId.insertId,
            };
            await db.inputQuery("INSERT INTO vitals SET ?", vitals);
          }

          var activity = {
            name: "Doctor Consultation",
            patient_id: req.body.patient_id,
          };
          var doctoruser = await db.execQuery(
            "SELECT phone,email,first_name,device_token,app_language  FROM users  where users_id = '" +
              req.body.doctor_id +
              "'"
          );

          console.log(doctoruser, "jkhjgyftdrytfuyjhcgj jghfchtfyuj");

          var patientUser = await db.execQuery(
            "SELECT phone,email,first_name  FROM users  where users_id = '" +
              req.body.patient_id +
              "'"
          );
          var emailtitle = "Patient Check-In";
          var emaillang = "en";
          if (
            doctoruser[0].app_language &&
            doctoruser[0].app_language == "es"
          ) {
            emaillang = "es";
            emailtitle = "Un paciente te llama por videoconsulta";
          }
          if (recordexist.length > 0) {
            var updatewaitingroom = await db.inputQuery(
              "UPDATE waiting_rooms SET ? WHERE patient_id ='" +
                req.body.patient_id +
                "'",
              waitingparams
            );
            if (updatewaitingroom.affectedRows > 0) {
              await db.inputQuery("INSERT INTO activity SET ?", activity);
              // if(doctoruser[0].phone && doctoruser[0].phone!=''){
              if (
                doctoruser[0].device_token &&
                doctoruser[0].device_token != ""
              ) {
                common.sendpushnotification(
                  doctoruser[0].device_token,
                  noti_msg,
                  title,
                  "mysound"
                );
                var notification = {
                  title: title,
                  text: noti_msg,
                  doctor_id: req.body.doctor_id,
                };
                await db.inputQuery(
                  "INSERT INTO notifications SET ?",
                  notification
                );
                //  console.log('doctor 1')
              }

              // 		}
              // for run server
              // var msg = {
              // 	from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
              // 	to: doctoruser[0].email,
              // 	subject: emailtitle,
              // 	html: common.patientCheckingNotify({ name: doctoruser[0].first_name }, emaillang)
              // };
              // var sendEmail = await sgMail.send(msg);
              // if (sendEmail[0].statusCode == 202) {
              res.status(200).json({
                status_code: 200,
                status_message: "Call add in waiting room successfully",
                result: waitingparams,
              });
              // } else {
              // 	res.status(200).json({ "status_code": 200, "status_message": "Call add in waiting room successfully", result: waitingparams });
              // }
            } else {
              res.status(200).json({
                status_code: 500,
                status_message: "internal server error",
              });
            }
          } else {
            var createWaitingCall = await db.inputQuery(
              "INSERT INTO waiting_rooms SET ?",
              waitingparams
            );
            if (createWaitingCall) {
              await db.inputQuery("INSERT INTO activity SET ?", activity);
              // 			if(doctoruser.phone && doctoruser.phone!=''){
              if (doctoruser.device_token && doctoruser.device_token != "") {
                common.sendpushnotification(
                  doctoruser.device_token,
                  noti_msg,
                  title,
                  "mysound"
                );
                var notification = {
                  title: title,
                  text: noti_msg,
                  doctor_id: req.body.doctor_id,
                };
                await db.inputQuery(
                  "INSERT INTO notifications SET ?",
                  notification
                );
              }

              // 		}
              // run for server
              // var msg = {
              // 	from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
              // 	to: doctoruser[0].email,
              // 	subject: emailtitle,
              // 	html: common.patientCheckingNotify({ name: doctoruser[0].first_name }, emaillang)
              // };
              // var sendEmail = await sgMail.send(msg);
              // if (sendEmail[0].statusCode == 202) {
              res.status(200).json({
                status_code: 200,
                status_message: "Call add in waiting room successfully",
                result: waitingparams,
              });
              // } else {
              // 	res.status(200).json({ "status_code": 200, "status_message": "Call add in waiting room successfully", result: waitingparams });
              // }
            } else {
              res.status(200).json({
                status_code: 500,
                status_message: "Internal Server Error",
              });
            }
          }
        } else {
          res.status(200).json({
            status_code: 500,
            status_message: "Internal Server Error",
          });
        }
      }
    });
  } catch (err) {
    logger.error(pathName, "makeCall -Error :-", err, ":");
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /patient/appointment/makeCall:
 *   post:
 *     tags:
 *       - patient
 *     description: patient make a call in appointment case
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: pet make a call in appointment case
 *         schema:
 *           type: object
 *           properties:
 *             patient_id:
 *               type: integer
 *             agent_id:
 *               type: integer
 *             symptoms:
 *               type: string
 *             allergies:
 *               type: string
 *             medications:
 *               type: string
 *             doctor_id:
 *               type: integer
 *             channel_name:
 *               type: string
 *             call_id:
 *               type: integer

 *     responses:
 *       200:
 *         description: patient call successfully
 *       500:
 *         description: internal server error
 */
patient.appointmentMakeCall = async function (req, res) {
  logger.info(pathName, "appointmentMakeCall ", req.body.patient_id);
  try {
    if (!req.body.patient_id || req.body.patient_id == "") {
      logger.error(
        pathName,
        "appointmentMakeCall mandatory field is patient id required :"
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Patient details are missing.",
      });
    }
    console.log(req.body.doctor_id);
    if (!req.body.doctor_id || req.body.doctor_id == "") {
      logger.error(
        pathName,
        "appointmentMakeCall mandatory field dactor id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Doctor details is missing",
      });
    }
    if (!req.body.call_id || req.body.call_id == "") {
      logger.error(
        pathName,
        "appointmentMakeCall mandatory field call id  is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Call details is missing." });
    }
    if (!req.body.channel_name || req.body.channel_name == "") {
      logger.error(
        pathName,
        "appointmentMakeCall mandatory field channel name is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Channel name is missing for video call.",
      });
    }
    var petRecordexist = await db.execQuery(
      "SELECT * FROM waiting_rooms WHERE patient_id = '" +
        req.body.patient_id +
        "'"
    );
    var waitingparams = {
      patient_id: req.body.patient_id,
      symptoms: req.body.symptoms,
      allergies: req.body.allergies,
      agent_id: req.body.agent_id,
      medications: req.body.medications,
      doctor_id: req.body.doctor_id,
      // 			remarks: req.body.remarks ? req.body.remarks : '',
      chanel_name: req.body.channel_name,
      checked_in: moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss"),
      status: "WAITING",
      call_id: req.body.call_id,
    };
    var noti_msg =
      "A patient has checked in for an instant call, please look into your call queue.";
    var title = "Patient Check-In";
    var activity = {
      name: "Doctor Consultation",
      patient_id: req.body.patient_id,
    };
    var doctoruser = await db.execQuery(
      "SELECT phone,email,first_name,device_token,app_language  FROM users  where users_id = '" +
        req.body.doctor_id +
        "'"
    );
    var patientUser = await db.execQuery(
      "SELECT phone,email,first_name  FROM users  where users_id = '" +
        req.body.patient_id +
        "'"
    );
    var emailtitle = "Patient Check-In";
    var emaillang = "en";
    if (doctoruser[0].app_language && doctoruser[0].app_language == "es") {
      emaillang = "es";
      emailtitle = "Un paciente te llama por videoconsulta";
    }
    console.log(doctoruser);
    let params1 = {
      patient_connected_at: moment()
        .tz("Asia/Kolkata")
        .format("YYYY-MM-DD HH:mm:ss"),
      video_connect: 1,
    };
    if (petRecordexist.length > 0) {
      var updatevetAppointment = await db.inputQuery(
        "UPDATE waiting_rooms SET ? WHERE patient_id ='" +
          req.body.patient_id +
          "'",
        waitingparams
      );
      if (updatevetAppointment.affectedRows > 0) {
        var callLogsUpdate = await db.inputQuery(
          "UPDATE user_call_logs SET ? WHERE id ='" + req.body.call_id + "'",
          params1
        );
        if (callLogsUpdate.affectedRows > 0) {
          await db.inputQuery("INSERT INTO activity SET ?", activity);
          //  if(doctoruser[0].phone && doctoruser[0].phone!=''){
          if (doctoruser[0].device_token && doctoruser[0].device_token != "") {
            common.sendpushnotification(
              doctoruser[0].device_token,
              noti_msg,
              title
            );
            var notification = {
              title: title,
              text: noti_msg,
              doctor_id: req.body.doctor_id,
            };
            await db.inputQuery(
              "INSERT INTO notifications SET ?",
              notification
            );
            console.log("doctor 1");
          }

          // 		}
          //run for server
          // var msg = {
          // 	from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
          // 	to: doctoruser[0].email,
          // 	subject: emailtitle,
          // 	html: common.patientCheckingNotify({ name: doctoruser[0].first_name }, emaillang)
          // };
          // var sendEmail = await sgMail.send(msg);
          // if (sendEmail[0].statusCode == 202) {
          res.status(200).json({
            status_code: 200,
            status_message: "Schedule a call by patient",
            result: { call_id: req.body.callId },
          });
          // } else {
          // 	res.status(200).json({ "status_code": 200, "status_message": "Schedule a call by patient", result: { call_id: req.body.callId } });
          // }
        } else {
          res.status(200).json({
            status_code: 500,
            status_message: "internal server error",
          });
        }
      } else {
        res
          .status(200)
          .json({ status_code: 500, status_message: "internal server error" });
      }
    } else {
      var createWaitingCall = await db.inputQuery(
        "INSERT INTO waiting_rooms SET ?",
        waitingparams
      );
      if (createWaitingCall) {
        var callLogsUpdate = await db.inputQuery(
          "UPDATE user_call_logs SET ? WHERE id ='" + req.body.call_id + "'",
          params1
        );
        if (callLogsUpdate.affectedRows > 0) {
          await db.inputQuery("INSERT INTO activity SET ?", activity);
          // if(doctoruser[0].phone && doctoruser[0].phone!=''){
          if (doctoruser[0].device_token && doctoruser[0].device_token != "") {
            common.sendpushnotification(
              doctoruser[0].device_token,
              noti_msg,
              title
            );
            var notification = {
              title: title,
              text: noti_msg,
              doctor_id: req.body.doctor_id,
            };
            await db.inputQuery(
              "INSERT INTO notifications SET ?",
              notification
            );
            console.log("doctor 1");
          }

          // 		}
          // run for server
          // var msg = {
          // 	from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
          // 	to: doctoruser[0].email,
          // 	subject: emailtitle,
          // 	html: common.patientCheckingNotify({ name: doctoruser[0].first_name }, emaillang)
          // };
          // var sendEmail = await sgMail.send(msg);
          // if (sendEmail[0].statusCode == 202) {
          res.status(200).json({
            status_code: 200,
            status_message: "Schedule a call by patient",
            result: { call_id: req.body.callId },
          });
          // } else {
          // 	res.status(200).json({ "status_code": 200, "status_message": "Schedule a call by patient", result: { call_id: req.body.callId } });
          // }
        } else {
          res.status(200).json({
            status_code: 500,
            status_message: "internal server error",
          });
        }
      } else {
        res
          .status(200)
          .json({ status_code: 500, status_message: "internal server error" });
      }
    }
  } catch (err) {
    logger.error(pathName, "appointmentMakeCall -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "internal server error" });
  }
};
/**
 * @swagger
 * /patient/specialities/list:
 *   get:
 *     tags:
 *       - patient
 *     description: Return all specialities list
 *     responses:
 *       200:
 *         description: All specialities List
 *       404:
 *         description: Specialities list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
patient.specialityList = async function (req, res) {
  logger.info(pathName, "All specialities list");
  try {
    var allspeciality = await db.execQuery(
      "SELECT * from specialities where is_active =1 "
    );
    if (allspeciality.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "All specialities List",
        result: allspeciality,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "No  specialities found" });
    }
  } catch (err) {
    logger.error(pathName, "Specialities -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};
/**
 * @swagger
 * /patient/payment:
 *   post:
 *     tags:
 *       - patient
 *     description: add payment details
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: add payment details.
 *         schema:
 *           type: object
 *           properties:
 *             card_no:
 *               type: string
 *             amount:
 *               type: integer
 *             payment_method:
 *               type: string
 *             patient_id:
 *               type: string
 *             transaction_id:
 *               type: string
 *             doctor_service_amount:
 *               type: string
 *             company_service_amount:
 *               type: string
 *             coupon_id:
 *               type: integer
 *             status:
 *               type: string
 *             billing_address:
 *               type: string
 *             display_name:
 *               type: string
 *             doctor_id:
 *               type: string
 *     responses:
 *       200:
 *         description: payment details add successfully
 */
patient.addPayment = async function (req, res) {
  logger.info(pathName, "addpayment patient_id", req.body.patient_id);
  try {
    if (!req.body.amount || req.body.amount == "") {
      logger.error(
        pathName,
        "addpayment mandatory field amount is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Amount is missing." });
    }
    if (
      !req.body.doctor_service_amount ||
      req.body.doctor_service_amount == ""
    ) {
      logger.error(
        pathName,
        "addpayment mandatory field company and doctor service amount is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Doctor service amount is required.",
      });
    }
    if (!req.body.patient_id || req.body.patient_id == "") {
      logger.error(
        pathName,
        "addpayment mandatory field patient is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Patient is missing." });
    }
    if (!req.body.doctor_id || req.body.doctor_id == "") {
      logger.error(
        pathName,
        "addpayment mandatory field doctor is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Doctor is missing." });
    }
    if (!req.body.transaction_id || req.body.transaction_id.trim() == "") {
      logger.error(
        pathName,
        "addpayment mandatory field transaction id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Transaction id is missing.",
      });
    }
    req.body.coupon_id =
      !req.body.coupon_id || req.body.coupon_id == "" ? 0 : req.body.coupon_id;
    var params = {
      card_no: req.body.card_no,
      amount: req.body.amount,
      payment_method: req.body.payment_method,
      patient_id: req.body.patient_id,
      // amount: req.body.totalAmount,
      doctor_id: req.body.doctor_id,
      doctor_service_amount: req.body.doctor_service_amount,
      company_service_amount: req.body.company_service_amount,
      coupon_id: req.body.coupon_id,
      transaction_id: req.body.transaction_id,
      status: req.body.status,
      billing_address: req.body.billing_address,
      display_name: req.body.display_name,
    };
    var createPayment = await db.inputQuery(
      "INSERT INTO payments SET ?",
      params
    );
    if (createPayment) {
      res.status(200).json({
        status_code: 200,
        status_message: "Payment Details Added Successfully",
        result: createPayment.insertId,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 500, status_message: "Internal Server Error" });
    }
  } catch (err) {
    logger.error(pathName, "addpayment -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /patient/vitals/:patient_id:
 *   get:
 *     tags:
 *       - patient
 *     description: Return all vitals list based on patient id
 *     responses:
 *       200:
 *         description: All vitals List for patient
 *       404:
 *         description: Vitals list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
patient.getVitals = async function (req, res) {
  logger.info(pathName, "All vitals list");
  try {
    var allvitals = await db.execQuery(
      "SELECT * from vitals where patient_id=" +
        req.params.patient_id +
        " ORDER BY id DESC limit 10"
    );
    if (allvitals.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "All vitals List",
        result: allvitals,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "No  vitals found" });
    }
  } catch (err) {
    logger.error(pathName, "vitals -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};
/**
 * @swagger
 * /patient/activity/:patient_id:
 *   get:
 *     tags:
 *       - patient
 *     description: Return all my activity list based on patient id
 *     responses:
 *       200:
 *         description: All activity List for patient
 *       404:
 *         description: Activity list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
patient.activity = async function (req, res) {
  logger.info(pathName, "All Activity list");
  try {
    var allActivity = await db.execQuery(
      "SELECT * from activity where patient_id=" +
        req.params.patient_id +
        " ORDER BY id DESC limit 10"
    );
    if (allActivity.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "All activity List",
        result: allActivity,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "No  activity found" });
    }
  } catch (err) {
    logger.error(pathName, "activity -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /patient/dashboard/count/:patient_id:
 *   get:
 *     tags:
 *       - patient
 *     description: Return all count appointment and prescription
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Return all count appointment and prescription
 *
 */
patient.dashboardCount = async function (req, res) {
  logger.info(pathName, "count for patient dashboard");
  try {
    var query =
      "SELECT ( SELECT COUNT(id) FROM appointments  where patient_id='" +
      req.params.patient_id +
      "' ) AS t_appointment,( SELECT COUNT(id) FROM appointments  where STATUS =\"cancelled\" AND patient_id='" +
      req.params.patient_id +
      "' ) AS c_appointment,( SELECT COUNT(id) FROM appointments  where date >  NOW()  AND patient_id='" +
      req.params.patient_id +
      "'  ) AS up_appointment,0 AS prescription";

    var allCount = await db.execQuery(query);
    res.status(200).json({
      status_code: 200,
      status_message: "All Dashboard Count Details",
      result: allCount[0],
    });
  } catch (err) {
    logger.error(
      pathName,
      "count for patient dashboard -Error :-",
      err,
      ":",
      __line
    );
    res
      .status(200)
      .json({ status_code: 500, status_message: "internal server error" });
  }
};

/**
 * @swagger
 * /patient/getPayment/:page/:limit/:patient_id:
 *   get:
 *     tags:
 *       - patient
 *     description: Return all payment based on paient id
 *     parameters:
 *       - name: id
 *         description: patient id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: All past payment list by a patient id
 *       404:
 *         description: payment list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
patient.getPaymentRecord = async function (req, res) {
  logger.info(pathName, "payment record patient id", req.params.patient_id);
  if (!req.params.patient_id || req.params.patient_id == "") {
    logger.error(
      pathName,
      "Payment record mandatory field patient id is required:",
      __line
    );
    return res.status(200).json({
      status_code: 400,
      status_message: "Patient id is missing for get past payment.",
    });
  }
  try {
    var limit = req.params.limit || 20;
    var offset = req.params.page > 0 ? req.params.page - 1 : 0;
    var query =
      "SELECT users.first_name,payments.amount,payments.payment_method,payments.transaction_id,payments.doctor_service_amount,payments.status FROM `payments` LEFT JOIN users on users.users_id = payments.doctor_id where payments.patient_id =" +
      req.params.patient_id;
    // 		if (req.params.camp_id && req.params.camp_id.trim() != "0") {
    // 		    query = query + " where users.camp_id="+req.params.camp_id;
    // 		}
    query =
      query +
      " ORDER BY payments.created_at DESC limit " +
      limit +
      " offset " +
      limit * offset;
    var paymentDetails = await db.execQuery(query);
    if (paymentDetails.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "All payment record List",
        result: paymentDetails,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "No payment record found" });
    }
  } catch (err) {
    logger.error(pathName, "Payment record -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /document/add:
 *   post:
 *     tags:
 *       - patient
 *     description: add document
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: add document
 *         schema:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             type:
 *               type: string
 *             patient_id:
 *               type: string
 *             call_id:
 *               type: string
 *             upload_by:
 *               type: string
 *     responses:
 *       200:
 *         description: speciality add successfully
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
patient.addDocument = async function (req, res) {
  logger.info(pathName, "Add document ");
  try {
    if (!req.body.url || req.body.url == "") {
      logger.error(
        pathName,
        "add document mandatory field url is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Url is required." });
    }
    if (!req.body.type || req.body.type == "") {
      logger.error(
        pathName,
        "add document mandatory field type is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Type is required." });
    }
    if (!req.body.upload_by || req.body.upload_by == "") {
      logger.error(
        pathName,
        "add document mandatory field type is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Upload by Id is required.",
      });
    }
    // 		var specialityExist = await db.exequery("SELECT * FROM specialities WHERE name = '" + req.body.name + "'");
    // 		if (specialityExist.length > 0) {
    // 			return res.status(200).json({ "status_code": 409, "status_message": "Speciality already Exist" });
    // 		} else {
    var params = {
      patient_id: req.body.patient_id,
      url: req.body.url,
      type: req.body.type,
      is_active: 1,
      call_id: req.body.call_id,
      upload_by: req.body.upload_by,
    };
    var createDocument = await db.inputQuery(
      "INSERT INTO documents SET ?",
      params
    );
    if (createDocument) {
      return res.status(200).json({
        status_code: 201,
        status_message: "Document uploaded successfully",
        result: createDocument,
      });
    } else {
      return res
        .status(200)
        .json({ status_code: 500, status_message: "Internal Server Error" });
    }
    // 		}
  } catch (err) {
    logger.error(pathName, "add document  -Error :-", err, ":", __line);
    return res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /patient/document/:page/:limit/:patient_id/:call_id?:
 *   get:
 *     tags:
 *       - patient
 *     description: Return all document based on paient id
 *     parameters:
 *       - name: id
 *         description: patient id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: All document list by a patient id
 *       404:
 *         description: document list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
patient.getDocumentRecord = async function (req, res) {
  logger.info(pathName, "Document patient id", req.params.patient_id);
  if (!req.params.patient_id || req.params.patient_id == "") {
    logger.error(
      pathName,
      "Document record mandatory field patient id is required:",
      __line
    );
    return res.status(200).json({
      status_code: 400,
      status_message: "Patient id is missing for get past payment.",
    });
  }
  try {
    var limit = req.params.limit || 20;
    var offset = req.params.page > 0 ? req.params.page - 1 : 0;

    var query =
      "SELECT * FROM `documents` where patient_id =" + req.params.patient_id;
    if (req.params.call_id) {
      query = query + " AND call_id = " + req.params.call_id;
    }
    // 		if (req.params.camp_id && req.params.camp_id.trim() != "0") {
    // 		    query = query + " where users.camp_id="+req.params.camp_id;
    // 		}
    query =
      query +
      " ORDER BY documents.created_at DESC limit " +
      limit +
      " offset " +
      limit * offset;
    var documentDetails = await db.execQuery(query);
    if (documentDetails.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "All document record List",
        result: documentDetails,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "No document record found" });
    }
  } catch (err) {
    logger.error(pathName, "Document record -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};
/**
 * @swagger
 * /patient/lastcalldetails/:patient_id:
 *   get:
 *     tags:
 *       - patient
 *     description: Return last call details
 *     responses:
 *       200:
 *         description: last call details
 *       404:
 *         description: call doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
patient.lastcalldetails = async function (req, res) {
  logger.info(pathName, "All call details");
  try {
    var alldetails = await db.execQuery(` 
		 SELECT 
			 symptoms,allergies,medications,doctor_comment,vitals.* 
			 from user_call_logs 
			 LEFT JOIN vitals 
			 on user_call_logs.id = vitals.call_id 
			 where user_call_logs.patient_id= ${req.params.patient_id} 
			 ORDER BY user_call_logs.id 
			 DESC limit 1
 		`);
    if (alldetails.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Call Details List",
        result: alldetails,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "Call not found" });
    }
  } catch (err) {
    logger.error(pathName, "vitals -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

module.exports = patient;
