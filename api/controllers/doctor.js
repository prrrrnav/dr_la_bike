const config = require("../config/config");
var doctor = function () {};
var moment = require("moment-timezone");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var common = require("../controllers/common");
var sgMail = require("../helper/sendemail");
var smsServer = require("../helper/sendSMS");
var logger = require("../middlewares/logger");
var db = require("../helper/database");
var uuidv4 = require("uuid/v4");
const { user } = require("../helper/User");
const { generateUserId } = require("./common");
var pathName = "Doctor file";
var __line;

/**
 * @swagger
 * /doctor/Search/:page/:limit/:speciality/:name:
 *   get:
 *     tags:
 *       - doctor
 *     description: search a Doctor by it's name,speciality in a camp
 *     responses:
 *       200:
 *         description: get a doctor list successfully
 *       404:
 *         description: doctor doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
doctor.search = async function (req, res) {
  var limit = req.params.limit;
  var offset = req.params.page > 0 ? req.params.page - 1 : 0;
  logger.info(pathName, "Doctor search");
  // 	if (!req.params.camp_id || req.params.camp_id == '') {
  // 		logger.error(pathName, 'Doctor Search mandatory field hospital id is required:', __line);
  // 		return res.status(200).json({ "status_code": 400, "status_message": "Hospital id is required." });
  // 	}
  try {
    req.params.name = req.params.name || "";
    var type = await db.execQuery(
      "SELECT module_assign_id FROM module_assign WHERE role = 'doctor'"
    );
    if (type.length <= 0) {
      logger.error(pathName, "check user type exist:", __line);
      return res.status(200).json({
        status_code: 400,
        status_message: "Please contact administrator for creating user type.",
      });
    }
    var sql =
      "SELECT users.*,GROUP_CONCAT(specialities.name) as s_name,(select AVG(ratings.rating) from ratings WHERE provider_id =users.users_id) as avgrating FROM users LEFT join specialities on FIND_IN_SET(specialities.id, users.speciality) WHERE user_type_id = '" +
      type[0].module_assign_id +
      "' and FIND_IN_SET('" +
      req.params.speciality +
      "', speciality)  and ( users.first_name LIKE '%" +
      req.params.name +
      "%' OR  users.last_name LIKE '%" +
      req.params.name +
      "%' OR  users.middle_name LIKE '%" +
      req.params.name +
      "%' OR  users.phone LIKE '%" +
      req.params.name +
      "%') GROUP BY users_id ORDER BY users_id DESC limit " +
      limit +
      " offset " +
      limit * offset;
    console.log(sql);
    var existDoctor = await db.execQuery(sql);
    console.log("dfljd");
    console.log(existDoctor);
    if (existDoctor.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Doctor Search Results",
        result: existDoctor,
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "There  are no Doctor available",
      });
    }
  } catch (err) {
    logger.error(pathName, "Doctor search -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

doctor.statusUpdateDoctor = async (req, res) => {
  const { doctor_id, status_busy } = req.body;

  try {
    console.log(
      doctor_id,
      "doctor_id",
      "gudtsthryfdcv dcuf ydcsfydsvfdsvdyve yuwefyvyu ewfv vyukewydcffvsd vfyfewcyugfyyu 7gfeyuwwyukfwe wui ewfiyefwg yuwegfuwe yfwewyufewguiefgwuiwe we efyugfuygwefy yfwe wyggfwe"
    );
    var params = {
      status_busy: status_busy,
    };
    var updateDoctor = await db.inputQuery(
      "UPDATE users SET ? WHERE users_id ='" + doctor_id + "'",
      params
    );
    var type = await db.execQuery(
      "SELECT * FROM users WHERE (users_id = '" + doctor_id + "') "
    );

    res.status(200).json({
      status_code: 200,
      status_message: "Doctor availability",
      result: type[0],
    });
  } catch (err) {
    logger.error(pathName, "Doctor availability -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /doctor/availability/:uuid:
 *   get:
 *     tags:
 *       - doctor
 *     description: a Doctor availability
 *     responses:
 *       200:
 *         description: get a doctor availability successfully
 *       404:
 *         description: doctor doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
doctor.getAvailability = async function (req, res) {
  logger.info(pathName, "Doctor availability");
  if (!req.params.uuid || req.params.uuid == "") {
    logger.error(
      pathName,
      "Doctor availability mandatory field uuid is required:",
      __line
    );
    return res
      .status(200)
      .json({ status_code: 400, status_message: "Uuid is required." });
  }
  try {
    var type = await db.execQuery(
      "SELECT module_assign_id FROM module_assign WHERE role = 'doctor'"
    );
    if (type.length <= 0) {
      logger.error(pathName, "check user type exist:", __line);
      return res.status(200).json({
        status_code: 400,
        status_message: "Please contact administrator for creating user type.",
      });
    }
    var sql =
      "SELECT users.availability FROM users WHERE uuid = '" +
      req.params.uuid +
      "' and user_type_id = '" +
      type[0].module_assign_id +
      "'";
    var existDoctor = await db.execQuery(sql);
    if (existDoctor.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Doctor availability",
        result: existDoctor[0],
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "There  are no Doctor available",
      });
    }
  } catch (err) {
    logger.error(pathName, "Doctor availability -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

// /**
//  * @swagger
//  * /doctor/signUp:
//  *   post:
//  *     tags:
//  *       - doctor
//  *     description: required field - education_details,year_of_experience,facility,station,facility_role,speciality,certificate_documents,camp_id,email,phone,role
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     parameters:
//  *       - name: body
//  *         description:  user signup as a doctor
//  *         in: body
//  *         required: true
//  *         schema:
//  *           type: object
//  *           properties:
//  *             camp_id:
//  *               type: string
//  *             name:
//  *               type: string
//  *             first_last_name:
//  *               type: string
//  *             second_last_name:
//  *               type: string
//  *             title:
//  *               type: string
//  *             date_of_birth:
//  *               type: string
//  *             image:
//  *               type: string
//  *             email:
//  *               type: string
//  *             phone:
//  *               type: string
//  *             rfc_number:
//  *               type: string
//  *             gender:
//  *               type: string
//  *             certificate_documents:
//  *               type: string
//  *             address1:
//  *               type: string
//  *             speciality:
//  *               type: string
//  *             language:
//  *               type: string
//  *             curp_number:
//  *               type: string
//  *             bio:
//  *               type: string
//  *             education_details:
//  *               type: string
//  *             year_of_experience:
//  *               type: string
//  *     responses:
//  *       201:
//  *         description: doctor add successfully
//  *       409:
//  *         description: doctor already exist
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  */
// doctor.signUp = async function (req, res) {
// 	logger.info(pathName, 'Doctor signup');
// 	try {
// 		if (!req.body.camp_id || (req.body.camp_id && req.body.camp_id.trim()=='')) {
// 			logger.error(pathName, 'Doctor signup mandatory field hospital/clinic id is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Required hospital/clinic id field." });
//         }
// 		if (!req.body.email || (req.body.email && req.body.email.trim() == '') || common.emailValidation( req.body.email)) {
// 			return res.status(200).json({ "status_code": 400, "status_message": "Email is required." });
// 		}
// 		if (!req.body.phone || (req.body.phone && req.body.phone.trim() == '') || common.phoneValidation( req.body.phone)) {
// 			return res.status(200).json({ "status_code": 400, "status_message": "Phone is required." });
// 		}
// 		if (!req.body.year_of_experience || (req.body.year_of_experience && req.body.year_of_experience.trim() == '')) {
// 			return res.status(200).json({ "status_code": 400, "status_message": "Year of experience is required." });
// 		}
// 		if (!req.body.speciality || req.body.speciality.trim()=='') {
// 			return res.status(200).json({ "status_code": 400, "status_message": "Speciality is required." });
// 		}
// 		if (!req.body.education_details || req.body.education_details.trim()=='') {
// 			return res.status(200).json({ "status_code": 400, "status_message": "Education details is required." });
//         }

// 		var existHospital = await db.exequery("SELECT camp_id FROM hospital_lists WHERE camp_id = '"+req.body.camp_id+"' AND is_active = 1");
// 		if (existHospital.length <= 0) {
// 			logger.error(pathName, 'invalid hospital id:', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for get hospital id."});
// 		}
// 		var type = await db.exequery("SELECT module_assign_id FROM module_assign WHERE role = 'doctor'");
// 		if (type.length <= 0) {
// 			logger.error(pathName, 'check user type exist:', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for creating user type." });
// 		}
// 		var query = "SELECT * FROM users WHERE (email = '" + req.body.email + "'OR phone = '"+req.body.phone+"') AND user_type_id = '"+type[0].module_assign_id+"' AND parent_id = 0"

// 		var existdoctor = await db.exequery(query);
// 		if (existdoctor.length > 0) {
// 			logger.error(pathName, 'doctor already exist:', __line);
// 			return res.status(200).json({ "status_code": 409, "status_message": "This Email/phone already exist Please try again with another details." });
// 		}
// 		var params = {
// 			uuid: uuidv4(),
// 			is_active: 1,
// 			user_type_id: type[0].module_assign_id,
//             camp_id:req.body.camp_id,
//             email: req.body.email,
//             first_last_name:req.body.first_last_name,
//             title:req.body.title,
//             second_last_name:req.body.second_last_name,
//             date_of_birth:req.body.date_of_birth,
//             phone: req.body.phone,
//             name: req.body.name,
// 			image: req.body.image,
//             rfc_number:req.body.rfc_number,
//             gender: req.body.gender,
//             certificate_documents: req.body.certificate_documents,
//             address1: req.body.address1,
//             speciality: req.body.speciality,
// 			language: req.body.language,
//             bio:req.body.bio,
//             curp_number: req.body.curp_number,
//             education_details: req.body.education_details,
//             year_of_experience: req.body.year_of_experience
// 		}

// 		var createDoctor = await db.inupquery('INSERT INTO users SET ?', params);
// 		if (createDoctor) {
// 			var doctor = await db.exequery("SELECT * FROM users WHERE users_id = '" + createDoctor.insertId + "'");
// 			if (doctor.length > 0) {

// 			 var msg = {
// 				from: 'Dr. LaBike <' + config.sendgrid.sendgridemail + '>',
// 				to: req.body.email,
// 				subject: "Welcome in Dr. LaBike",
// 				html: common.addDoctorTemplate({name:doctor[0].name,email:doctor[0].email,phone:doctor[0].phone})
// 			};
// 			var sendEmail = await sgMail.send(msg);
// 			if (sendEmail[0].statusCode == 202) {
// 					res.status(200).json({ "status_code": 201, "status_message": "Doctor added successfully.", "result": doctor[0] });
// 			} else {
// 					res.status(200).json({ "status_code": 201, "status_message": "Doctor added successfully.", "result": doctor[0] });
// 			}

// 				// common.getJwtAuthToken(doctor[0].uuid, function (err, callbackresult) {
// 				// 	if (err) {
// 				// 		res.status(200).json({ "status_code": 401, "status_message": common.errorGenerateAuthToken });
// 				// 	} else if (callbackresult.status_code == 200) {
// 				// 		doctor[0].access_token = callbackresult.data.access_token;

// 				// 	}
// 				// });
// 			} else {
// 				res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 			}
// 		} else {
// 			res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 		}
// 	} catch (err) {
// 		// in case of error or exception
// 		logger.error(pathName, 'create Doctor -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }

/**
 * @swagger
 * /doctor/signUp:
 *   post:
 *     tags:
 *       - doctor
 *     description: required field - education_details,year_of_experience,facility,station,facility_role,speciality,certificate_documents,camp_id,email,phone,role
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: body
 *         description:  user signup as a doctor
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             camp_id:
 *               type: string
 *             middle_name:
 *               type: string
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *             title:
 *               type: string
 *             date_of_birth:
 *               type: string
 *             state:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             city:
 *               type: string
 *             gender:
 *               type: string
 *             zip_code:
 *               type: string
 *             address1:
 *               type: string
 *             speciality:
 *               type: string
 *             language:
 *               type: string
 *             institution_name:
 *               type: string
 *             bio:
 *               type: string
 *             licence:
 *               type: string
 *             year_of_experience:
 *               type: string
 *             year:
 *               type: string
 *             degree:
 *               type: string
 *             national_licence:
 *               type: string
 *     responses:
 *       201:
 *         description: doctor add successfully
 *       409:
 *         description: doctor already exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
doctor.signUp = async function (req, res) {
  logger.info(pathName, "Doctor signup");
  let defaultPassword = "123456";
  try {
    // 		if (!req.body.camp_id || (req.body.camp_id && req.body.camp_id.trim()=='')) {
    // 			logger.error(pathName, 'Doctor signup mandatory field hospital/clinic id is required :', __line);
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Required hospital/clinic id field." });
    //         }
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
      !req.body.year_of_experience ||
      (req.body.year_of_experience && req.body.year_of_experience.trim() == "")
    ) {
      return res.status(200).json({
        status_code: 400,
        status_message: "Year of experience is required.",
      });
    }
    if (!req.body.speciality) {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Speciality is required." });
    }
    // if (!req.body.institution_name || req.body.institution_name.trim() == '') {
    // 	return res.status(200).json({ "status_code": 400, "status_message": "Education details is required." });
    // }

    // 		var existHospital = await db.exequery("SELECT camp_id FROM hospital_lists WHERE camp_id = '"+req.body.camp_id+"' AND is_active = 1");
    // 		if (existHospital.length <= 0) {
    // 			logger.error(pathName, 'invalid hospital id:', __line);
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for get hospital id."});
    // 		}
    var type = await db.execQuery(
      "SELECT module_assign_id FROM module_assign WHERE role = 'doctor'"
    );
    if (type.length <= 0) {
      logger.error(pathName, "check user type exist:", __line);
      return res.status(200).json({
        status_code: 400,
        status_message: "Please contact administrator for creating user type.",
      });
    }
    var query =
      "SELECT * FROM users WHERE (email = '" +
      req.body.email +
      "'OR phone = '" +
      req.body.phone +
      "') AND user_type_id = '" +
      type[0].module_assign_id +
      "' AND parent_id = 0";

    var existdoctor = await db.execQuery(query);
    if (existdoctor.length > 0) {
      logger.error(pathName, "doctor already exist:", __line);
      return res.status(200).json({
        status_code: 409,
        status_message:
          "This Email/phone already exist Please try again with another details.",
      });
    }
    const uuid = await generateUserId();
    var params = {
      uuid,
      is_active: 1,
      user_type_id: type[0].module_assign_id,
      camp_id: req.body.camp_id || 0,
      email: req.body.email,
      password: crypto.createHash("md5").update("123456").digest("hex"),
      first_name: req.body.first_name,
      title: req.body.title,
      last_name: req.body.last_name,
      date_of_birth: moment(req.body.date_of_birth).format(
        "yyyy-MM-DD HH:mm:ss"
      ),
      phone: req.body.phone,
      middle_name: req.body.middle_name,
      year: req.body.year,
      licence: req.body.licence,
      institution_name: req.body.institution_name,
      gender: req.body.gender,
      state: req.body.state,
      address1: req.body.address,
      speciality: req.body.speciality,
      language: req.body.language,
      bio: req.body.bio,
      city: req.body.city,
      zip_code: req.body.zip_code,
      education_details: req.body.education_details,
      degree: req.body.degree,
      year_of_experience: req.body.year_of_experience,
      national_licence: req.body.national_licence,
    };

    if (
      req.body.amount &&
      req.body.commission_perc &&
      req.body.consultation_fee
    ) {
      params.credit = req.body.amount;
      params.commission_perc = req.body.commission_perc;
      params.consultation_fee = req.body.consultation_fee;
    }

    var createDoctor = await db.inputQuery("INSERT INTO users SET ?", params);
    if (createDoctor) {
      var doctor = await db.execQuery(
        "SELECT * FROM users WHERE users_id = '" + createDoctor.insertId + "'"
      );
      if (doctor.length > 0) {
        var emailtitle = "Welcome to Dr. LaBike";
        var emaillang = "en";
        if (doctor[0].app_language && doctor[0].app_language == "es") {
          emailtitle = "Bienvenido a Dr. LaBike";
          emaillang = "es";
        }
        var msg = {
          from: "Dr. LaBike <" + config.sendgrid.sendgridemail + ">",
          to: req.body.email,
          subject: emailtitle,
          html: common.addDoctorTemplate(
            {
              role: "doctor",
              password: defaultPassword,
              name: doctor[0].first_name + " " + doctor[0].last_name,
              email: doctor[0].email,
              phone: doctor[0].phone,
              password: "123456",
            },
            emaillang
          ),
        };
        var sendEmail = await sgMail.send(msg);
        if (sendEmail[0].statusCode == 202) {
          res.status(200).json({
            status_code: 201,
            status_message: "Doctor added successfully.",
            result: doctor[0],
          });
        } else {
          res.status(200).json({
            status_code: 201,
            status_message: "Doctor added successfully.",
            result: doctor[0],
          });
        }

        // common.getJwtAuthToken(doctor[0].uuid, function (err, callbackresult) {
        // 	if (err) {
        // 		res.status(200).json({ "status_code": 401, "status_message": common.errorGenerateAuthToken });
        // 	} else if (callbackresult.status_code == 200) {
        // 		doctor[0].access_token = callbackresult.data.access_token;

        // 	}
        // });
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
    logger.error(pathName, "create Doctor -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /representative/signUp:
 *   post:
 *     tags:
 *       - doctor
 *     description: create representative
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: body
 *         description:  user signup as a representative
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             camp_id:
 *               type: string
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             aadhaar_number:
 *               type: string
 *             gender:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zip_code:
 *               type: string
 *             address:
 *               type: string
 *     responses:
 *       201:
 *         description:  representative add successfully
 *       409:
 *         description: representative already exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
doctor.agentSignUp = async function (req, res) {
  logger.info(pathName, "Representative signup");
  let defaultPassword = "123456";
  try {
    if (
      !req.body.camp_id ||
      (req.body.camp_id && req.body.camp_id.trim() == "")
    ) {
      logger.error(
        pathName,
        "Clinic signup mandatory field camp id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Required clinic id field.",
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
    // 		if (!req.body.year_of_experience || (req.body.year_of_experience && req.body.year_of_experience.trim() == '')) {
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Year of experience is required." });
    // 		}
    if (!req.body.aadhaar_number || req.body.aadhaar_number.trim() == "") {
      return res.status(200).json({
        status_code: 400,
        status_message: "Aadhaar number is required.",
      });
    }
    if (!req.body.gender || req.body.gender.trim() == "") {
      return res.status(200).json({
        status_code: 400,
        status_message: "Gender details is required.",
      });
    }
    if (!req.body.first_name || req.body.first_name.trim() == "") {
      return res.status(200).json({
        status_code: 400,
        status_message: "First name details is required.",
      });
    }

    // 		var existHospital = await db.exequery("SELECT camp_id FROM hospital_lists WHERE camp_id = '"+req.body.camp_id+"' AND is_active = 1");
    // 		if (existHospital.length <= 0) {
    // 			logger.error(pathName, 'invalid hospital id:', __line);
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for get clinic id."});
    // 		}
    var type = await db.execQuery(
      "SELECT module_assign_id FROM module_assign WHERE role = 'representative'"
    );
    if (type.length <= 0) {
      logger.error(pathName, "check user type exist:", __line);
      return res.status(200).json({
        status_code: 400,
        status_message: "Please contact administrator for creating user type.",
      });
    }
    var query =
      "SELECT * FROM users WHERE (email = '" +
      req.body.email +
      "'OR phone = '" +
      req.body.phone +
      "') AND user_type_id = '" +
      type[0].module_assign_id +
      "' AND parent_id = 0";

    var existagent = await db.execQuery(query);
    if (existagent.length > 0) {
      logger.error(pathName, "agent already exist:", __line);
      return res.status(200).json({
        status_code: 409,
        status_message:
          "This Email/phone already exist Please try again with another details.",
      });
    }
    const uuid = await generateUserId();
    var params = {
      uuid,
      is_active: 1,
      user_type_id: type[0].module_assign_id,
      camp_id: req.body.camp_id,
      email: req.body.email,
      password: crypto.createHash("md5").update("123456").digest("hex"),
      first_name: req.body.first_name,
      // title:req.body.title,
      last_name: req.body.last_name,
      // date_of_birth:req.body.date_of_birth,
      phone: req.body.phone,
      // middle_name: req.body.middle_name,
      image: req.body.image,
      // rfc_number:req.body.rfc_number,
      gender: req.body.gender,
      aadhaar_number: req.body.aadhaar_number,
      zip_code: req.body.zip_code,
      state: req.body.state,
      // certificate_documents: req.body.certificate_documents,
      address1: req.body.address,
      city: req.body.city,
      // speciality: req.body.speciality,
      // language: req.body.language,
      // bio:req.body.bio,
      // curp_number: req.body.curp_number,
      // education_details: req.body.education_details,
      // year_of_experience: req.body.year_of_experience
    };

    if (req.body.amount) {
      params.credit = req.body.amount;
    }

    if (req.body.commission_perc) {
      params.commission_perc = req.body.commission_perc;
    }

    var createAgent = await db.inputQuery("INSERT INTO users SET ?", params);
    if (createAgent) {
      var agent = await db.execQuery(
        "SELECT * FROM users WHERE users_id = '" + createAgent.insertId + "'"
      );
      if (agent.length > 0) {
        var emailtitle = "Welcome to Dr. LaBike";
        var emaillang = "en";
        if (agent[0].app_language && agent[0].app_language == "es") {
          emailtitle = "Bienvenido a Dr. LaBike";
          emaillang = "es";
        }
        var msg = {
          from: "Dr. LaBike <" + config.sendgrid.sendgridemail + ">",
          to: req.body.email,
          subject: emailtitle,
          html: common.addDoctorTemplate(
            {
              role: "representative",
              password: defaultPassword,
              name: agent[0].first_name,
              email: agent[0].email,
              phone: agent[0].phone,
              password: "123456",
            },
            emaillang
          ),
        };
        var sendEmail = await sgMail.send(msg);
        if (sendEmail[0].statusCode == 202) {
          res.status(200).json({
            status_code: 201,
            status_message: "Clinic added successfully.",
            result: agent[0],
          });
        } else {
          res.status(200).json({
            status_code: 201,
            status_message: "Clinic added successfully.",
            result: agent[0],
          });
        }

        // common.getJwtAuthToken(doctor[0].uuid, function (err, callbackresult) {
        // 	if (err) {
        // 		res.status(200).json({ "status_code": 401, "status_message": common.errorGenerateAuthToken });
        // 	} else if (callbackresult.status_code == 200) {
        // 		doctor[0].access_token = callbackresult.data.access_token;

        // 	}
        // });
      } else {
        res.status(200).json({
          status_code: 500,
          status_message: "Internal Server Error",
          line: __fileName + ":" + 618,
        });
      }
    } else {
      res.status(200).json({
        status_code: 500,
        status_message: "Internal Server Error",
        line: __fileName + ":" + 621,
      });
    }
  } catch (err) {
    // in case of error or exception
    logger.error(pathName, "create Representative -Error :-", err, ":", __line);
    res.status(200).json({
      status_code: 500,
      status_message: "Internal Server Error",
      line: __fileName + ":" + 626,
      err,
    });
  }
};
// /**
//  * @swagger
//  * /doctor/update/:uuid:
//  *   put:
//  *     tags:
//  *       - doctor
//  *     description: update doctor details
//  *     produces:
//  *       - application/x-www-form-urlencoded
//  *     parameters:
//  *       - name: body
//  *         description:  update doctor details
//  *         in: body
//  *         required: true
//  *         schema:
//  *           type: object
//  *           properties:
//  *             name:
//  *               type: string
//  *             image:
//  *               type: string
//  *             rfc_number:
//  *               type: string
//  *             gender:
//  *               type: string
//  *             certificate_documents:
//  *               type: string
//  *             address1:
//  *               type: string
//  *             speciality:
//  *               type: string
//  *             date_of_birth:
//  *               type: string
//  *             language:
//  *               type: string
//  *             curp_number:
//  *               type: string
//  *             bio:
//  *               type: string
//  *             education_details:
//  *               type: string
//  *             year_of_experience:
//  *               type: string
//  *             role:
//  *               type: string
//  *             first_last_name:
//  *               type: string
//  *             second_last_name:
//  *               type: string
//  *             course_training:
//  *               type: string
//  *             signature:
//  *               type: string
//  *             title:
//  *               type: string
//  *             professional_cert_no:
//  *               type: string
//  *             speciality_cert_no:
//  *               type: string
//  *     responses:
//  *       200:
//  *         description: doctor update successfully
//  *       404:
//  *         description: doctor doesn't exist
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  */

// doctor.updateDoctor = async function (req, res) {
// 	logger.info(pathName, 'Doctor update');
// 	try {
// // 		if (!req.body.year_of_experience || (req.body.year_of_experience && req.body.year_of_experience.trim() == '')) {
// // 			return res.status(200).json({ "status_code": 400, "status_message": "Year of experience is required." });
// // 		}
// 		if (!req.body.speciality || req.body.speciality.trim()=='') {
// 			return res.status(200).json({ "status_code": 400, "status_message": "Speciality is required." });
// 		}
// 		if (!req.body.certificate_documents || req.body.certificate_documents.trim()=='' || !req.body.education_details || req.body.education_details.trim() == '') {
// 			return res.status(200).json({ "status_code": 400, "status_message": "Certificate documents and education details is required." });
//         }
// 		if (!req.body.name || req.body.name.trim()=='') {
// 			return res.status(200).json({ "status_code": 400, "status_message": "Name  is required." });
// 		}
// 		if (!req.body.rfc_number || req.body.rfc_number.trim()=='' || !req.body.curp_number || req.body.curp_number.trim()=='') {
// 			return res.status(200).json({ "status_code": 400, "status_message": "RFC/CURP number  is required." });
// 		}
// 		if (!req.body.address1 || req.body.address1.trim()=='' || !req.body.language || req.body.language.trim()=='') {
// 			return res.status(200).json({ "status_code": 400, "status_message": "Address/language  is required." });
// 		}
// 		if (!req.body.role) {
// 			return res.status(200).json({ "status_code": 400, "status_message": "Role is required." });
// 		}
// 		var existuser = await db.exequery("SELECT users_id FROM users WHERE uuid = '"+req.params.uuid+"' AND user_type_id = "+req.body.role);
// 		if (existuser.length <= 0) {
// 			logger.error(pathName, 'invalid users uuid:', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Invalid Doctor Details."});
// 		}
// 		var params = {
//             name: req.body.name,
// 			image: req.body.image,
//             rfc_number:req.body.rfc_number,
//             gender: req.body.gender,
//             certificate_documents: req.body.certificate_documents,
//             address1: req.body.address1,
//             speciality: req.body.speciality,
// 			language: req.body.language,
//             bio:req.body.bio,
//             curp_number: req.body.curp_number,
//             education_details: req.body.education_details,
// 			year_of_experience: req.body.year_of_experience?req.body.year_of_experience:null,
// 			date_of_birth: moment(req.body.date_of_birth).format("yyyy-MM-DD HH:mm:ss"),
// 			first_last_name: req.body.first_last_name,
// 			second_last_name: req.body.second_last_name,
//             course_training:req.body.course_training,
//             signature: req.body.signature,
//             title: req.body.title,
//             professional_cert_no:req.body.professional_cert_no,
//             speciality_cert_no: req.body.speciality_cert_no
// 		}
// 		var updateDoctor = await db.inupquery('UPDATE users SET ? WHERE users_id =\'' + existuser[0].users_id + '\'', params);
// 		if (updateDoctor.affectedRows>0) {
// 			res.status(200).json({ "status_code": 200, "status_message": "Doctor profile updated successfully.", "result": updateDoctor });
// 		} else {
// 			res.status(200).json({ "status_code": 404, "status_message": "Something went wrong. Please try again." });
// 		}
// 	} catch (err) {
// 		// in case of error or exception
// 		logger.error(pathName, 'update Doctor -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }

/**
 * @swagger
 * /doctor/update/:uuid:
 *   put:
 *     tags:
 *       - doctor
 *     description: update doctor details
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: body
 *         description:  update doctor details
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             first_name:
 *               type: string
 *             middle_name:
 *               type: string
 *             last_name:
 *               type: string
 *             state:
 *               type: string
 *             city:
 *               type: string
 *             gender:
 *               type: string
 *             image:
 *               type: string
 *             licence:
 *               type: string
 *             address:
 *               type: string
 *             speciality:
 *               type: string
 *             date_of_birth:
 *               type: string
 *             language:
 *               type: string
 *             zip_code:
 *               type: string
 *             bio:
 *               type: string
 *             institution_name:
 *               type: string
 *             year_of_experience:
 *               type: string
 *             role:
 *               type: string
 *             degree:
 *               type: string
 *             year:
 *               type: string
 *             title:
 *               type: string
 *             national_licence:
 *               type: string
 *     responses:
 *       200:
 *         description: doctor update successfully
 *       404:
 *         description: doctor doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */

doctor.updateDoctor = async function (req, res) {
  logger.info(pathName, "Doctor update");
  try {
    // 		if (!req.body.year_of_experience || (req.body.year_of_experience && req.body.year_of_experience.trim() == '')) {
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Year of experience is required." });
    // 		}
    if (!req.body.speciality) {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Speciality is required." });
    }
    // 		if (!req.body.education_details || req.body.education_details.trim() == '') {
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Certificate documents and education details is required." });
    //         }
    if (!req.body.first_name || req.body.first_name.trim() == "") {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Name  is required." });
    }
    if (!req.body.licence || req.body.licence.trim() == "") {
      return res.status(200).json({
        status_code: 400,
        status_message: "RFC/CURP number  is required.",
      });
    }
    if (!req.body.address || req.body.address.trim() == "") {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Address  is required." });
    }
    // 		if (!req.body.role) {
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Role is required." });
    // 		}
    if (!req.body.bio || req.body.bio.trim() == "") {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Role is required." });
    }
    var existuser = await db.execQuery(
      "SELECT users_id FROM users WHERE uuid = '" +
        req.params.uuid +
        "' AND user_type_id = 3"
    );
    if (existuser.length <= 0) {
      logger.error(pathName, "invalid users uuid:", __line);
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Invalid Doctor Details." });
    }
    var params = {
      title: req.body.title,
      first_name: req.body.first_name,
      middle_name: req.body.middle_name,
      last_name: req.body.last_name,
      image: req.body.image,
      state: req.body.state,
      city: req.body.city,
      gender: req.body.gender,
      licence: req.body.licence,
      address1: req.body.address,
      speciality: req.body.speciality,
      language: req.body.language,
      bio: req.body.bio,
      national_licence: req.body.national_licence,
      institution_name: req.body.institution_name,
      year_of_experience: req.body.year_of_experience
        ? req.body.year_of_experience
        : 0,
      date_of_birth: moment(req.body.date_of_birth).format(
        "yyyy-MM-DD HH:mm:ss"
      ),

      education_details: req.body.education_details,
      zip_code: req.body.zip_code,
      degree: req.body.degree,

      year: req.body.year,
      // speciality_cert_no: req.body.speciality_cert_no
    };

    if (req.body.commission_perc && req.body.consultation_fee) {
      params.commission_perc = req.body.commission_perc;
      params.consultation_fee = req.body.consultation_fee;
    }

    // if (req.body.image) {
    // 	params.image = req.body.image;
    // }
    var updateDoctor = await db.inputQuery(
      "UPDATE users SET ? WHERE users_id ='" + existuser[0].users_id + "'",
      params
    );
    if (updateDoctor.affectedRows > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Profile updated successfully.",
        result: updateDoctor,
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "Something went wrong. Please try again.",
      });
    }
  } catch (err) {
    // in case of error or exception
    logger.error(pathName, "update Doctor -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /agent/update/:uuid:
 *   put:
 *     tags:
 *       - doctor
 *     description: update doctor details
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: body
 *         description:  update doctor details
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *             phone:
 *               type: string
 *             gender:
 *               type: string
 *             state:
 *               type: string
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             zip_code:
 *               type: string
 *             camp_id:
 *               type: string
 *     responses:
 *       200:
 *         description: doctor update successfully
 *       404:
 *         description: doctor doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */

doctor.updateagent = async function (req, res) {
  logger.info(pathName, "Doctor update");
  try {
    // 		if (!req.body.year_of_experience || (req.body.year_of_experience && req.body.year_of_experience.trim() == '')) {
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Year of experience is required." });
    // 		}
    if (
      !req.body.first_name ||
      req.body.first_name.trim() == "" ||
      !req.body.last_name ||
      req.body.last_name.trim() == ""
    ) {
      return res.status(200).json({
        status_code: 400,
        status_message: "First and Last name is required.",
      });
    }
    // 		if (!req.body.education_details || req.body.education_details.trim() == '') {
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Certificate documents and education details is required." });
    //         }
    if (!req.body.phone || req.body.phone.trim() == "") {
      return res.status(200).json({
        status_code: 400,
        status_message: "Phone number  is required.",
      });
    }
    if (!req.body.address || req.body.address.trim() == "") {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Address  is required." });
    }

    if (!req.body.gender || req.body.gender.trim() == "") {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Gender is required." });
    }
    if (!req.body.state || req.body.state.trim() == "") {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "State is required." });
    }
    if (
      !req.body.city ||
      req.body.city.trim() == "" ||
      !req.body.zip_code ||
      req.body.zip_code.trim() == ""
    ) {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "City/Pin is required." });
    }
    if (!req.body.camp_id || req.body.camp_id.trim() == "") {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Clinic is required." });
    }
    var existuser = await db.execQuery(
      "SELECT users_id FROM users WHERE uuid = '" +
        req.params.uuid +
        "' AND user_type_id = 5"
    );
    if (existuser.length <= 0) {
      logger.error(pathName, "invalid users uuid:", __line);
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Invalid Clinic Details." });
    }
    var params = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      image: req.body.image,
      phone: req.body.phone,
      address1: req.body.address,
      gender: req.body.gender,
      state: req.body.state,
      city: req.body.city,
      zip_code: req.body.zip_code,
      camp_id: req.body.camp_id,
    };
    if (req.body.commission_perc) {
      params.commission_perc = req.body.commission_perc;
    }
    // if (req.body.image) {
    // 	params.image = req.body.image;
    // }
    var updateAgent = await db.inputQuery(
      "UPDATE users SET ? WHERE users_id ='" + existuser[0].users_id + "'",
      params
    );
    if (updateAgent.affectedRows > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Profile updated successfully.",
        result: updateAgent,
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "Something went wrong. Please try again.",
      });
    }
  } catch (err) {
    // in case of error or exception
    logger.error(pathName, "update Representative -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

// /**
//  * @swagger
//  * /doctor/appointment/upcoming/:doctor_id/:page/:limit:
//  *   get:
//  *     tags:
//  *       - doctor
//  *     description: Return all upcoming appointment by doctor id
//  *
//  *     parameters:
//  *       - name: id
//  *         description: doctor id
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
//  doctor.upcomingAppointments = async function (req, res) {
// 	logger.info(pathName, 'Upcoming Appointments doctor id ', req.params.doctor_id);
// 	if (!req.params.doctor_id || req.params.doctor_id == '') {
// 		logger.error(pathName, 'Upcoming Appointments mandatory field doctor id is required:', __line);
// 		return res.status(200).json({ "status_code": 400, "status_message": "Doctor id is missing for get upcoming appointment." });
// 	}
// 	try {
// 		var limit =req.params.limit || 20;
// 		var offset = req.params.page>0?req.params.page-1:0;
// 		var appointmentDetails = await db.exequery("SELECT appointments.*,users.*,user_call_logs.*,vitals.oxygen_blood_saturation,vitals.heart_rate_variation,vitals.heart_rate,vitals.accelerometer FROM appointments LEFT JOIN users ON appointments.patient_id = users.users_id LEFT JOIN vitals ON appointments.call_id = vitals.call_id LEFT JOIN user_call_logs ON appointments.call_id = user_call_logs.id where  date >  NOW() AND user_call_logs.video_connect !=1 AND appointments.doctor_id ='" + req.params.doctor_id + "' ORDER BY appointments.date DESC limit "+limit+" offset "+limit*offset);
// 		if (appointmentDetails.length > 0) {
// 			return res.status(200).json({ "status_code": 200, "status_message": "All Upcoming appointments", "result": appointmentDetails });
// 		} else {
// 			return res.status(200).json({ "status_code": 404, "status_message": "No upcoming appointments found" });
// 		}

// 	} catch (err) {
// 		logger.error(pathName, 'Upcoming Appointments by doctor -Error :-', err, ':', __line);
// 		return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }

/**
 * @swagger
 * /doctor/appointment/upcoming/:doctor_id/:page/:limit:
 *   get:
 *     tags:
 *       - doctor
 *     description: Return all upcoming appointment by doctor id
 *
 *     parameters:
 *       - name: id
 *         description: doctor id
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
doctor.upcomingAppointments = async function (req, res) {
  logger.info(
    pathName,
    "Upcoming Appointments doctor id ",
    req.params.doctor_id
  );
  if (!req.params.doctor_id || req.params.doctor_id == "") {
    logger.error(
      pathName,
      "Upcoming Appointments mandatory field doctor id is required:",
      __line
    );
    return res.status(200).json({
      status_code: 400,
      status_message: "Doctor id is missing for get upcoming appointment.",
    });
  }
  try {
    var limit = req.params.limit || 20;
    var offset = req.params.page > 0 ? req.params.page - 1 : 0;

    const now = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss");

    var appointmentDetails = await db.execQuery(
      "SELECT vitals.id as vital_id, vitals.doctor_id as vital_doc_id, vitals.*, appointments.id as appointment_id,appointments.*,user_call_logs.id as call_id, user_call_logs.doctor_id as call_doc_id,user_call_logs.symptoms as symptoms,user_call_logs.allergies as allergies, user_call_logs.*,users.symptoms as u_symp, users.allergies as u_aller, users.title,users.first_name,users.last_name,users.image,users.email,users.phone,users.education_details,users.height as p_height,users.weight as p_weight FROM appointments LEFT JOIN users ON appointments.patient_id = users.users_id LEFT JOIN vitals ON appointments.call_id = vitals.call_id LEFT JOIN user_call_logs ON appointments.call_id = user_call_logs.id where DATE_ADD(appointments.date, INTERVAL '05:00' HOUR_SECOND) > '" +
        now +
        "' AND user_call_logs.video_connect !=1 AND appointments.doctor_id ='" +
        req.params.doctor_id +
        "' ORDER BY appointments.date ASC limit " +
        limit +
        " offset " +
        limit * offset
    );
    if (appointmentDetails.length > 0) {
      return res.status(200).json({
        status_code: 200,
        status_message: "All Upcoming appointments",
        result: appointmentDetails,
      });
    } else {
      return res.status(200).json({
        status_code: 404,
        status_message: "No upcoming appointments found",
      });
    }
  } catch (err) {
    logger.error(
      pathName,
      "Upcoming Appointments by doctor -Error :-",
      err,
      ":",
      __line
    );
    return res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

// /**
//  * @swagger
//  * /doctor/appointment/past/:doctor_id/:page/:limit:
//  *   get:
//  *     tags:
//  *       - doctor
//  *     description: Return all past appointment by doctor id
//  *     parameters:
//  *       - name: id
//  *         description: doctor id
//  *         in: path
//  *         required: true
//  *         type: integer
//  *     responses:
//  *       200:
//  *         description: All past appointments list	by a doctor
//  *       404:
//  *         description: Appointments list doesn't exist
//  *     security:
//  *     - petstore_auth:
//  *       - "write:pets"
//  *       - "read:pets"
//  *
//  */
// doctor.pastAppointments = async function (req, res) {
// 	logger.info(pathName, 'Past Appointments doctor id', req.params.doctor_id);
// 	if (!req.params.doctor_id || req.params.doctor_id == '') {
// 		logger.error(pathName, 'Past Appointments mandatory field doctor id is required:', __line);
// 		return res.status(200).json({ "status_code": 400, "status_message": "Doctor id is missing for get past appointment." });
// 	}
// 	try {
// 		var limit =req.params.limit || 20;
// 		var offset = req.params.page>0?req.params.page-1:0;
// 		var appointmentDetails = await db.exequery("SELECT user_call_logs.id as call_id,user_call_logs.*,users.*,appointments.status,vitals.oxygen_blood_saturation,vitals.heart_rate_variation,vitals.heart_rate,vitals.accelerometer,prescription.id as prescription_id FROM user_call_logs LEFT JOIN vitals ON user_call_logs.id = vitals.call_id LEFT JOIN prescription ON user_call_logs.id = prescription.call_id LEFT JOIN users ON user_call_logs.patient_id = users.users_id LEFT JOIN appointments ON user_call_logs.id = appointments.call_id where (user_call_logs.video_connect =1 OR (appointments.status = 'CANCELLED' AND appointments.date <  NOW()) ) AND user_call_logs.doctor_id =" + req.params.doctor_id + " ORDER BY user_call_logs.id DESC limit "+limit+" offset "+limit*offset);
// 		if (appointmentDetails.length > 0) {
// 		    console.log(appointmentDetails[0]);
// 			res.status(200).json({ "status_code": 200, "status_message": "All past appointment List", "result": appointmentDetails });
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
 * /doctor/appointment/past/:doctor_id/:page/:limit:
 *   get:
 *     tags:
 *       - doctor
 *     description: Return all past appointment by doctor id
 *     parameters:
 *       - name: id
 *         description: doctor id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: All past appointments list	by a doctor
 *       404:
 *         description: Appointments list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
doctor.pastAppointments = async function (req, res) {
  logger.info(pathName, "Past Appointments doctor id", req.params.doctor_id);
  if (!req.params.doctor_id || req.params.doctor_id == "") {
    logger.error(
      pathName,
      "Past Appointments mandatory field doctor id is required:",
      __line
    );
    return res.status(200).json({
      status_code: 400,
      status_message: "Doctor id is missing for get past appointment.",
    });
  }
  try {
    var limit = req.params.limit || 20;
    var offset = req.params.page > 0 ? req.params.page - 1 : 0;
    var appointmentDetails = await db.execQuery(
      "SELECT user_call_logs.id as call_id,user_call_logs.*,users.title,users.first_name,users.last_name,users.image,users.email,users.phone,users.education_details,users.height as p_height,users.weight as p_weight,appointments.status,vitals.oxygen_blood_saturation,vitals.heart_rate_variation,vitals.heart_rate,vitals.accelerometer,prescription.diagnostic,prescription.medicine,prescription.treatment,prescription.indications_and_notes,prescription.height,prescription.weight,prescription.id as prescription_id FROM user_call_logs LEFT JOIN vitals ON user_call_logs.id = vitals.call_id LEFT JOIN prescription ON user_call_logs.id = prescription.call_id LEFT JOIN users ON user_call_logs.patient_id = users.users_id LEFT JOIN appointments ON user_call_logs.id = appointments.call_id where (user_call_logs.video_connect =1 ) AND user_call_logs.doctor_id =" +
        req.params.doctor_id +
        " ORDER BY user_call_logs.id DESC limit " +
        limit +
        " offset " +
        limit * offset
    );
    if (appointmentDetails.length > 0) {
      console.log(appointmentDetails);
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
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /doctor/updateAvailability/:uuid:
 *   put:
 *     tags:
 *       - doctor
 *     description: update doctor availability details
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: body
 *         description:  update doctor availability details
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             availability:
 *               type: string
 *             role:
 *               type: string
 *     responses:
 *       200:
 *         description: doctor availability update successfully
 *       404:
 *         description: doctor availability doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */

doctor.updateDoctorAvailability = async function (req, res) {
  logger.info(pathName, "Doctor availability update");
  try {
    if (
      !req.body.availability ||
      (req.body.availability && req.body.availability.trim() == "")
    ) {
      return res.status(200).json({
        status_code: 400,
        status_message: "Availability is required.",
      });
    }
    // if (!req.body.time_Off || req.body.time_Off.trim()=='') {
    // 	return res.status(200).json({ "status_code": 400, "status_message": "TimeOff is required." });
    // }
    // if (!req.body.in_clinic_consultation || req.body.in_clinic_consultation.trim()=='') {
    // 	return res.status(200).json({ "status_code": 400, "status_message": "InClinic Consultation is required." });
    //     }
    if (!req.body.role || req.body.role.trim() == "") {
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Role is required." });
    }
    var existuser = await db.execQuery(
      "SELECT users_id FROM users WHERE uuid = '" +
        req.params.uuid +
        "' AND user_type_id = " +
        req.body.role
    );
    if (existuser.length <= 0) {
      logger.error(pathName, "invalid users uuid:", __line);
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Invalid Doctor Details." });
    }
    var params = {
      availability: req.body.availability,
      // time_Off: req.body.time_Off,
      //       in_clinic_consultation:req.body.in_clinic_consultation
    };
    var updateDoctor = await db.inputQuery(
      "UPDATE users SET ? WHERE users_id ='" + existuser[0].users_id + "'",
      params
    );
    if (updateDoctor.affectedRows > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Time slot updated successfully.",
        result: updateDoctor,
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "Something went wrong. Please try again.",
      });
    }
  } catch (err) {
    // in case of error or exception
    logger.error(
      pathName,
      "update availability Doctor -Error :-",
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
 * /doctor/callWaitingList/:uuid:
 *   get:
 *     tags:
 *       - doctor
 *     description: get user waiting list based on doctor
 *     parameters:
 *       - name: uuid
 *         description: doctor uuid
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: array of user list in waiting room
 *       404:
 *         description:there are no user available in waiting list
 *
 */
doctor.callWaitingList = async function (req, res) {
  logger.info(pathName, "callWaitingList uuid", req.params);
  let isAdmin = user(req.userDetails).isOneOf("ADMIN", "SUPER_ADMIN");

  if (!req.params.uuid || req.params.uuid == "") {
    logger.error(
      pathName,
      "callWaitingList mandatory field uuid is required:",
      __line
    );
    return res
      .status(200)
      .json({ status_code: 400, status_message: "UUID is missing." });
  }
  try {
    var existuser = await db.execQuery(
      "SELECT users_id FROM users WHERE uuid = '" + req.params.uuid + "'"
    );
    if (existuser.length <= 0) {
      logger.error(pathName, "invalid users uuid:", __line);
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Invalid Doctor Details." });
    }

    let query = `
		SELECT waiting_rooms.id as waitingId,waiting_rooms.*,waiting_rooms.medications as w_medications,waiting_rooms.allergies as w_allergies,waiting_rooms.symptoms as w_symptoms,users.*,user_call_logs.reports_image FROM waiting_rooms LEFT JOIN users ON waiting_rooms.patient_id = users.users_id  LEFT JOIN user_call_logs ON waiting_rooms.call_id = user_call_logs.id  where status = 'WAITING'
		`;

    if (!isAdmin) {
      query += " AND waiting_rooms.doctor_id = " + existuser[0].users_id;
    }
    query += " ORDER BY waiting_rooms.created_at DESC";
    var userlist = await db.execQuery(query);

    logger.info(userlist, "userlist find");

    if (userlist.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "User list in waiting room",
        result: userlist,
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "There are no user in waiting list",
      });
    }
  } catch (err) {
    logger.error(pathName, "callWaitingList -Error :-", err, ":");
    res
      .status(200)
      .json({ status_code: 500, status_message: "internal server error" });
  }
};

/**
 * @swagger
 * /doctor/updated/callStatus:
 *   put:
 *     tags:
 *       - doctor
 *     description: update call status
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update call status
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *             call_id:
 *               type: string
 *     responses:
 *       200:
 *         description: update call status
 *       404:
 *         description: update call status
 *
 */
doctor.updateCallStatus = async function (req, res) {
  logger.info(pathName, "updateCallStatus");
  try {
    if (!req.body.call_id || req.body.call_id == "") {
      logger.error(
        pathName,
        "updateCallStatus mandatory field call_id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Mandatory field call id is missing.",
      });
    }
    if (!req.body.status || req.body.status.trim() == "") {
      logger.error(
        pathName,
        "updateCallStatus mandatory field status is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Mandatory field status is missing",
      });
    }
    var paramsdetails = {
      status: req.body.status,
    };
    var updateCallStatus = await db.inputQuery(
      "UPDATE waiting_rooms SET ? WHERE call_id ='" + req.body.call_id + "'",
      paramsdetails
    );
    if (req.body.status.toLowerCase() == "completed") {
      var params = {
        patient_disconnected_at: moment(new Date()).format(
          "YYYY-MM-DD HH:mm:ss"
        ),
      };
      await db.inputQuery(
        "UPDATE user_call_logs SET ? WHERE id ='" + req.body.call_id + "'",
        params
      );
    }
    if (updateCallStatus.affectedRows > 0) {
      return res.status(200).json({
        status_code: 200,
        status_message: "Update status successfully",
      });
    } else {
      return res.status(200).json({
        status_code: 404,
        status_message: "Call not available for update status",
      });
    }
  } catch (err) {
    logger.error(pathName, "updateCallStatus -Error :-", err, ":", __line);
    return res
      .status(200)
      .json({ status_code: 500, status_message: "internal server error" });
  }
};

// /**
//  * @swagger
//  * /doctor/getAllocatedTimeSlot/:id/:date:
//  *   post:
//  *     tags:
//  *       - doctor
//  *     description: get all allocated time slot
//  *     parameters:
//  *       - name: id
//  *         description: doctor id
//  *         in: path
//  *         required: true
//  *         type: integer
//  *       - name: date
//  *         description: date
//  *         in: path
//  *         required: true
//  *         type: string
//  *     responses:
//  *       200:
//  *         description: get all allocated time slot
//  *       404:
//  *         description: allocated  time not found yet
//  */
// doctor.getAllocatedTimeSlot = async function (req, res) {
// 	logger.info(pathName, 'getAllocatedTimeSlot');
// 	if (!req.params.id || req.params.id == '') {
// 		logger.error(pathName, 'getAllocatedTimeSlot mandatory field is id required:', __line);
// 		return res.status(200).json({ "status_code": 400, "status_message": "Doctor id is missing." });
// 	}
// 		if (!req.params.date || req.params.date == '') {
// 		logger.error(pathName, 'getAllocatedTimeSlot mandatory field date is required:', __line);
// 		return res.status(200).json({ "status_code": 400, "status_message": "Date is missing" });
// 	}
// 	try {
// 		var AllocatedSlot = await db.exequery("SELECT * FROM appointments WHERE DATE_FORMAT(date, '%Y-%m-%d') = DATE('" + req.params.date + "') AND " + req.params.id);
// 		if (AllocatedSlot.length > 0) {
// 			res.status(200).json({ "status_code": 200, "status_message": "Doctor allocated time", "result": AllocatedSlot });
// 		} else {
// 			res.status(200).json({ "status_code": 404, "status_message": "No allocated time slot available" });
// 		}
// 	} catch (err) {
// 		logger.error(pathName, 'allocated sloat -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "internal server error" });
// 	}
// }

/**
 * @swagger
 * /doctor/getAllocatedTimeSlot/:id/:date:
 *   post:
 *     tags:
 *       - doctor
 *     description: get all allocated time slot
 *     parameters:
 *       - name: id
 *         description: doctor id
 *         in: path
 *         required: true
 *         type: integer
 *       - name: date
 *         description: date
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: get all allocated time slot
 *       404:
 *         description: allocated  time not found yet
 */
doctor.getAllocatedTimeSlot = async function (req, res) {
  logger.info(pathName, "getAllocatedTimeSlot");
  if (!req.params.id || req.params.id == "") {
    logger.error(
      pathName,
      "getAllocatedTimeSlot mandatory field is id required:",
      __line
    );
    return res
      .status(200)
      .json({ status_code: 400, status_message: "Doctor id is missing." });
  }
  if (!req.params.date || req.params.date == "") {
    logger.error(
      pathName,
      "getAllocatedTimeSlot mandatory field date is required:",
      __line
    );
    return res
      .status(200)
      .json({ status_code: 400, status_message: "Date is missing" });
  }
  try {
    var AllocatedSlot = await db.execQuery(
      "SELECT * FROM appointments WHERE STATUS != 'CANCELLED' AND DATE_FORMAT(date, '%Y-%m-%d') = DATE('" +
        req.params.date +
        "') AND " +
        req.params.id
    );
    if (AllocatedSlot.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Doctor allocated time",
        result: AllocatedSlot,
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "No allocated time slot available",
      });
    }
  } catch (err) {
    logger.error(pathName, "allocated sloat -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "internal server error" });
  }
};

/**
 * @swagger
 * /update/doctor/notes:
 *   put:
 *     tags:
 *       - doctor
 *     description: update doctor notes
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update doctor notes
 *         schema:
 *           type: object
 *           properties:
 *             notes:
 *               type: string
 *             call_id:
 *               type: string
 *     responses:
 *       200:
 *         description: update doctor notes
 *       404:
 *         description: call doesn't exist
 *
 */
doctor.updatenotes = async function (req, res) {
  logger.info(pathName, "updatedoctorNotes");
  try {
    if (!req.body.call_id || req.body.call_id == "") {
      logger.error(
        pathName,
        "update doctor notes mandatory field call_id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Mandatory field call id is missing.",
      });
    }
    if (!req.body.notes || req.body.notes.trim() == "") {
      logger.error(
        pathName,
        "update notes mandatory field status is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Mandatory field notes is missing",
      });
    }
    var paramsdetails = {
      doctor_comment: req.body.notes,
    };

    var updatenotes = await db.inputQuery(
      "UPDATE user_call_logs SET ? WHERE id ='" + req.body.call_id + "'",
      paramsdetails
    );

    if (updatenotes.affectedRows > 0) {
      return res.status(200).json({
        status_code: 200,
        status_message: "Updated notes successfully",
      });
    } else {
      return res.status(200).json({
        status_code: 404,
        status_message: "Call not available for update notes",
      });
    }
  } catch (err) {
    logger.error(pathName, "update notes -Error :-", err, ":", __line);
    return res
      .status(200)
      .json({ status_code: 500, status_message: "internal server error" });
  }
};

/**
 * @swagger
 * /doctor/notification/:doctor_id:
 *   get:
 *     tags:
 *       - doctor
 *     description: Return all my notification list based on doctor id
 *     responses:
 *       200:
 *         description: All notification List for doctor
 *       404:
 *         description: Notification list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
doctor.notification = async function (req, res) {
  logger.info(pathName, "All notification list");
  try {
    var allnotification = await db.execQuery(
      "SELECT * from notifications where doctor_id=" +
        req.params.doctor_id +
        " ORDER BY id DESC limit 10"
    );
    if (allnotification.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "All activity List",
        result: allnotification,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "No  notification found" });
    }
  } catch (err) {
    logger.error(pathName, "notification -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};
module.exports = doctor;
