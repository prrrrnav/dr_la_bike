const logger = require("../middlewares/logger");
const db = require("../helper/database");
const { sendResponseInJson } = require("../utils/utils");
const crypto = require("crypto");
const uuidv4 = require("uuid/v4");
const { constants } = require("../constants");
const { user } = require("../helper/User")
const {generateUserId} = require("./common");

const PATH_NAME = 'User file';


/**
 *
 * @swagger
 * tags:
 *   name: Admin
 */

/**
 * @swagger
 * /admin/getDoctorList/:camp_id/:page?/:limit?:
 *   get:
 *     tags:
 *       - Admin
 *     description: get doctor list based on camp
 *     produces:
 *       - application/x-www-form-urlencoded
 *     responses:
 *       200:
 *         description: get doctor list Successfully
 *       404:
 *         description: doctor list doesn't exist
 *       401:
 *         description: Validation error with error obj containing the key
 */
module.exports.getDoctorListController = async function (req, res, next) {
  console.log('Getting doctor list!!! from my refactored code');
  logger.info(PATH_NAME, 'Get Doctor List', req.params.camp_id);
  try {

    const { limit, page, camp_id } = req.params;
    // const limit = req.params.limit || 20;
    const offset = page > 0 ? page - 1 : 0;
    const type = await db.execQuery("SELECT module_assign_id FROM module_assign WHERE role = 'doctor'");
    if (type.length <= 0) {
      logger.error(PATH_NAME, 'Get Doctor list :', __fileName + ':' + __line);
      return sendResponseInJson(res, 400, "Please contact administrator for creating user type.");
    }
    let query = 'SELECT users.*,specialities.name as s_name FROM users LEFT join specialities on specialities.id = users.speciality where user_type_id = \'' + type[0].module_assign_id + '\'';
    query = query + ' AND camp_id = \'' + camp_id + '\'';
    query = query + ' ORDER BY users_id DESC  limit ' + limit + ' offset ' + limit * offset;
    const doctors = await db.execQuery(query);
    if (doctors.length > 0) {
      return sendResponseInJson(res, 200, "Get Doctor List successfully", doctors);
    } else {
      return sendResponseInJson(res, 404, "Doctor list Doesn't exist");
    }
  } catch (err) {
    logger.error(PATH_NAME, 'Get Doctor List -Error :-', err, ':', __fileName + ':' + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
}



/**
 * @swagger
 * /admin/getAgentList/:page?/:limit?:
 *   get:
 *     tags:
 *       - Admin
 *     description: get agent list based on camp
 *     produces:
 *       - application/x-www-form-urlencoded
 *     responses:
 *       200:
 *         description: get agent list Successfully
 *       404:
 *         description: agent list doesn't exist
 *       401:
 *         description: Validation error with error obj containing the key
 */
module.exports.getAgentListController = async function (req, res) {
  logger.info(PATH_NAME, 'Get Agent List');
  try {

    const { limit, page } = req.params;

    const offset = page > 0 ? page - 1 : 0;
    const type = await db.execQuery("SELECT module_assign_id FROM module_assign WHERE role = 'representative'");
    if (type.length <= 0) {
      logger.error(PATH_NAME, 'get Doctor list :', __fileName + ':' + __line);
      return sendResponseInJson(res, 400, "Please contact administrator for creating user type.");
    }
    let query = 'SELECT * FROM users where user_type_id = \'' + type[0].module_assign_id + '\'';
    // 		if (camp_id && camp_id.trim() != "0") {
    // 			query = query + ' AND camp_id = \'' + camp_id + '\'';
    // 		}
    query = query + ' ORDER BY users_id DESC  limit ' + limit + ' offset ' + limit * offset;
    console.log('[adminControllers.js || Line no. 97 ....]', query);
    const agents = await db.execQuery(query);
    if (agents.length > 0) {
      return sendResponseInJson(res, 200, "Get Agent List successfully", agents);
    } else {
      return sendResponseInJson(res, 404, "Agent list Doesn't exist");
    }
  } catch (err) {
    logger.error(PATH_NAME, 'Get Agent List -Error :-', err, ':', __fileName + ':' + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
}

/**
 * @swagger
 * /admin/getPatientList/:camp_id/:page?/:limit?:
 *   get:
 *     tags:
 *       - Admin
 *     description: get patient list based on camp
 *     produces:
 *       - application/x-www-form-urlencoded
 *     responses:
 *       200:
 *         description: get patient list Successfully
 *       404:
 *         description: patient list doesn't exist
 *       401:
 *         description: Validation error with error obj containing the key
 */
module.exports.getPatientListController = async function (req, res) {
  logger.info(PATH_NAME, 'Get Patient List', req.params.camp_id);
  try {

    const { limit, page, camp_id } = req.params;
    const offset = page > 0 ? page - 1 : 0;
    const type = await db.execQuery("SELECT module_assign_id FROM module_assign WHERE role = 'patient'");
    if (type.length <= 0) {
      logger.error(PATH_NAME, 'get Patient list :', __fileName + ':' + __line);
      return sendResponseInJson(res, 400, "Please contact administrator for creating user type.");
    }
    let query = 'SELECT * FROM users where user_type_id = \'' + type[0].module_assign_id + '\'';

    // query = query + ' AND camp_id = \'' + camp_id + '\'';

    query = query + ' ORDER BY users_id DESC  limit ' + limit + ' offset ' + limit * offset;
    const patients = await db.execQuery(query);
    if (patients.length > 0) {
      return sendResponseInJson(res, 200, "Get Patient List successfully", patients);
    } else {
      return sendResponseInJson(res, 404, "Patient list Doesn't exist", query);
    }
  } catch (err) {
    logger.error(PATH_NAME, 'Get Patient List -Error :-', err, ':', __fileName + ':' + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
}

/**
 * @swagger
 * /admin/getAdminList/:camp_id/:page?/:limit?:
 *   get:
 *     tags:
 *       - Admin
 *     description: get admin list based on camp
 *     produces:
 *       - application/x-www-form-urlencoded
 *     responses:
 *       200:
 *         description: get admin list Successfully
 *       404:
 *         description: admin list doesn't exist
 *       401:
 *         description: Validation error with error obj containing the key
 */
module.exports.getAdminListController = async function (req, res) {
  logger.info(PATH_NAME, 'Get admin List', req.params.camp_id);
  try {

    const { limit, page, camp_id } = req.params;
    const offset = page > 0 ? page - 1 : 0;
    // 		var type = await db.exequery("SELECT module_assign_id FROM module_assign WHERE role = 'patient'");
    // 		if (type.length <= 0) {
    // 			logger.error(PATH_NAME, 'get Patient list :', __fileName + ':' + __line);
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for creating user type." });
    // 		}
    let query = 'SELECT * FROM users where user_type_id NOT in (1,3,4,5)';
    // query = query + ' AND camp_id = ' + camp_id;
    query = query + ' ORDER BY users_id DESC  limit ' + limit + ' offset ' + limit * offset;
    const admins = await db.execQuery(query);
    if (admins.length > 0) {
      return sendResponseInJson(res, 200, "Get Admin List successfully", admins);
    } else {
      return sendResponseInJson(res, 404, "Admin list Doesn't exist");
    }
  } catch (err) {
    logger.error(PATH_NAME, 'Get Admin List -Error :-', err, ':', __fileName + ':' + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
}

/**
 * @swagger
 * /admin/appointment/upcoming/:page/:limit/:camp_id:
 *   get:
 *     tags:
 *       - Admin
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
 *       401:
 *         description: Validation error with error obj containing the key
 *
 */
module.exports.upcomingAppointmentsController = async function (req, res) {
  logger.info(PATH_NAME, 'Upcoming Appointments camp id', req.params.camp_id);
  // if (!camp_id || camp_id == '') {
  //   logger.error(PATH_NAME, 'Upcoming Appointments mandatory field camp id is required:', __fileName + ':' + __line);
  //   return res.status(200).json({ "status_code": 400, "status_message": "Camp id is missing for get upcoming appointment." });
  // }
  try {

    const { limit, page, camp_id } = req.params;
    const offset = page > 0 ? page - 1 : 0;
    let query = `
        SELECT appointments.id as appoint_id,appointments.*,camp_lists.camp_name,users.first_name as d_name,users.last_name as d_l_name,users.email as d_email,users.phone as d_phone,u.first_name as p_name,u.last_name as p_l_name,u.email as p_email,u.phone as p_phone,user_call_logs.* FROM appointments LEFT JOIN users ON appointments.doctor_id = users.users_id LEFT JOIN camp_lists ON camp_lists.camp_id = users.camp_id LEFT JOIN users as u ON appointments.patient_id = u.users_id LEFT JOIN user_call_logs ON appointments.call_id = user_call_logs.id where  date >  NOW() AND user_call_logs.video_connect !=1 `
    // 		if (camp_id && camp_id.trim() != "0") {
    // 		    query = query + " AND users.camp_id="+camp_id;
    // 		}
    query = query + " ORDER BY appointments.date DESC limit " + limit + " offset " + limit * offset;
    const appointments = await db.execQuery(query);
    if (appointments.length > 0) {
      return sendResponseInJson(res, 200, "All Upcoming appointments", appointments);
    } else {
      return sendResponseInJson(res, 404, "No upcoming appointments found");
    }

  } catch (err) {
    logger.error(PATH_NAME, 'Upcoming Appointments by camp_id -Error :-', err, ':', __fileName + ':' + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
}

/**
 * @swagger
 * /admin/appointment/past/:page/:limit/:camp_id:
 *   get:
 *     tags:
 *       - Admin
 *     description: Return all past appointment by camp id
 *     parameters:
 *       - name: id
 *         description: camp id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: All past appointments list  by a camp id
 *       404:
 *         description: Appointments list doesn't exist
 *       401:
 *         description: Validation error with error obj containing the key
 *
 */
module.exports.pastAppointmentsController = async function (req, res) {
  logger.info(PATH_NAME, 'Past Appointments camp id', req.params.camp_id);
  // if (!req.params.camp_id || req.params.camp_id == '') {
  //   logger.error(PATH_NAME, 'Past Appointments mandatory field camp id is required:', __line);
  //   return res.status(200).json({ "status_code": 400, "status_message": "Camp id is missing for get past appointment." });
  // }
  try {

    const { limit, page, camp_id } = req.params;
    const offset = page > 0 ? page - 1 : 0;
    let query = "SELECT user_call_logs.id as call_id,camp_lists.camp_name,user_call_logs.*,users.first_name as d_name,users.last_name as d_l_name,users.email as d_email,users.phone as d_phone,u.first_name as p_name,u.last_name as p_l_name,u.email as p_email,u.phone as p_phone,appointments.status,appointments.id as appoint_id FROM user_call_logs LEFT JOIN users ON user_call_logs.doctor_id = users.users_id LEFT JOIN camp_lists ON camp_lists.camp_id = users.camp_id LEFT JOIN users as u ON user_call_logs.patient_id = u.users_id LEFT JOIN appointments ON user_call_logs.id = appointments.call_id where (user_call_logs.video_connect =1)"
    // 		if (camp_id && camp_id.trim() != "0") {
    // 		    query = query + " AND users.camp_id="+camp_id;
    // 		}
    query = query + " ORDER BY user_call_logs.created_at DESC limit " + limit + " offset " + limit * offset;
    const appointments = await db.execQuery(query);
    if (appointments.length > 0) {
      return sendResponseInJson(res, 200, "All past appointments list", appointments);
    } else {
      return sendResponseInJson(res, 404, "No past appointments found");
    }
  } catch (err) {
    logger.error(PATH_NAME, 'Past Appointments -Error :-', err, ':', __fileName + ':' + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
}

/**
 * @swagger
 * /admin/payment/:page/:limit/:camp_id:
 *   get:
 *     tags:
 *       - Admin
 *     description: Return all payment list
 *     parameters:
 *       - name: id
 *         description: camp id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: All past payment list  by a camp id
 *       404:
 *         description: payment list doesn't exist
 *       401:
 *         description: Validation error with error obj containing the key
 *
 */
module.exports.paymentRecordController = async function (req, res) {
  logger.info(PATH_NAME, 'payment record camp id', req.params.camp_id);
  // if (!req.params.camp_id || req.params.camp_id == '') {
  //   logger.error(PATH_NAME, 'Payment record mandatory field camp id is required:', __line);
  //   return res.status(200).json({ "status_code": 400, "status_message": "Camp id is missing for get past appointment." });
  // }
  try {

    const { limit, page, camp_id } = req.params;
    const offset = page > 0 ? page - 1 : 0;
    let query = "SELECT payments.* FROM `payments` LEFT JOIN users on users.users_id = payments.patient_id "
    // if (camp_id && camp_id.trim() != "0") {
    //   query = query + " where users.camp_id="+camp_id;
    // }
    query = query + " ORDER BY payments.created_at DESC limit " + limit + " offset " + limit * offset;
    const paymentDetails = await db.execQuery(query);
    if (paymentDetails.length > 0) {
      return sendResponseInJson(res, 200, "All payment record list", paymentDetails);
    } else {
      return sendResponseInJson(res, 404, "No payment record found");
    }
  } catch (err) {
    logger.error(PATH_NAME, 'Payment record -Error :-', err, ':', __fileName + ':' + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
}

/**
 * @swagger
 * /admin/appointment/delete/:appointment_id:
 *   delete:
 *     tags:
 *       - Admin
 *     description: delete an appointment by appointment id
 *     parameters:
 *       - name: id
 *         description: appointment id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: delete an appointment successfully
 *       404:
 *         description: Appointments doesn't exist
 *       401:
 *         description: Validation error with error obj containing the key
 *
 */
module.exports.deleteAppointmentController = async function (req, res) {
  logger.info(PATH_NAME, 'Delete Appointments', req.params.appointment_id);
  try {
    // const results = validationResult(req);
    //
    // if (!results.isEmpty()) {
    //   return sendResponseInJson(res, 401, "Validation failed", results.array()[0]);
    // }

    const { appointment_id } = req.params;
    const query = "delete FROM appointments WHERE id = " + appointment_id;
    const deletedAppointment = await db.execQuery(query);

    if (!deletedAppointment.affectedRows > 0) {
      return sendResponseInJson(res, 404, "No appointment found");
    }

    return sendResponseInJson(res, 200, "Delete an appointment", deletedAppointment);

  } catch (err) {
    logger.error(PATH_NAME, 'Delete Appointments -Error :-', err, ':', __fileName + ':' + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
}

/**
 * @swagger
 * /admin/resetPassword:
 *   post:
 *     tags:
 *       - Admin
 *     description: reset password
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: reset password
 *         schema:
 *           type: object
 *           properties:
 *             user_id:
 *               type: string
 *             role:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Reset password successfully
 *       500:
 *         description: Internal Server Error
 *       401:
 *         description: Validation error with error obj containing the key
 */
module.exports.resetPasswordController = async function (req, res) {
  logger.info(PATH_NAME, 'reset Password id ', req.body.user_id);
  try {
    // if (!req.body.user_id || req.body.user_id == '') {
    //   logger.error(PATH_NAME, 'reset password mandatory field user idis required :', __line);
    //   return res.status(200).json({ "status_code": 400, "status_message": "User id is missing." });
    // }
    // if (!req.body.camp_id || req.body.camp_id == '') {
    //   logger.error(PATH_NAME, 'reset password mandatory field camp_id is required :', __line);
    //   return res.status(200).json({ "status_code": 400, "status_message": "Camp id is missing" });
    // }
    // if (!req.body.role || req.body.role == '') {
    //   logger.error(PATH_NAME, 'reset password mandatory field role is required :', __line);
    //   return res.status(200).json({ "status_code": 400, "status_message": "Role is missing." });
    // }
    // if (!req.body.password || req.body.password.trim() == '' || common.checkPassword(req.body.password)) {
    //   logger.error(PATH_NAME, 'reset password mandatory field password is required :', __line);
    //   return res.status(200).json({ "status_code": 400, "status_message": "Invalid password Please fill proper formate one numeric ,one Uppercase latter,one special character and length 8-16 digit ." });
    // }
    // if(req.body.password.length<20){

    const { password, role, user_id } = req.body;

    const hashedPassword = crypto.createHash("md5").update(password).digest("hex");
    // }
    const params = {
      password: hashedPassword
    }
    const updatePassword = await db.inputQuery('UPDATE users SET ? WHERE parent_id = 0  AND user_type_id =\'' + role + '\' AND users_id =\'' + user_id + '\'', params);

    if (!updatePassword.affectedRows > 0) {
      return sendResponseInJson(res, 404, "Invalid user details. Please try again");
    }

    return sendResponseInJson(res, 200, "Password updated successfully");

  } catch (err) {
    logger.error(PATH_NAME, 'reset password -Error :-', err, ':', __fileName + ':' + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
}

/**
 * @swagger
 * /admin/addPatient:
 *   post:
 *     tags:
 *       - Admin
 *     description: add user as a patient by admin
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: body
 *         description:  add user as a patient by admin
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             first_name:
 *               type: string
 *             middle_name:
 *               type: string
 *             last_name:
 *               type: string
 *             date_of_birth:
 *               type: string
 *             camp_id:
 *               type: string
 *             gender:
 *               type: string
 *             address:
 *               type: string
 *             aadhaar_number:
 *               type: string
 *             city:
 *               type: string
 *             country:
 *               type: string
 *             language:
 *               type: string
 *             image:
 *               type: string
 *     responses:
 *       201:
 *         description: patient add successfully
 *       409:
 *         description: patient already exist
 *       401:
 *         description: Validation error with error obj containing the key
 */
module.exports.addPatientController = async function (req, res) {
  logger.info(PATH_NAME, 'Add Patient');
  try {
    const type = await db.execQuery("SELECT module_assign_id FROM module_assign WHERE role = 'patient'");
    if (type.length <= 0) {
      logger.error(PATH_NAME, 'check user type exist:', __fileName + ':' + __line);
      return sendResponseInJson(res, 404, "Please contact administrator for creating user type.");
    }
    // var query;
    // if (isNumber) {
    const query = "SELECT * FROM users WHERE (aadhaar_number = '" + req.body.aadhaar_number + "' OR email = '" + req.body.email + "' OR phone = '" + req.body.phone + "') AND user_type_id = '" + type[0].module_assign_id + "' AND parent_id = 0"
    // } else {
    // query = "SELECT * FROM users WHERE  phone = '" + req.body.emailPhone + "' AND user_type_id = '" + type[0].module_assign_id + "' AND parent_id = 0"
    // }
    const existPatient = await db.execQuery(query);
    if (existPatient.length > 0) {
      // logger.error(PATH_NAME, 'Patient already exist:', __fileName + ':' + __line);
      return sendResponseInJson(res, 404, "A User with this Email/Mobile number/Aadhaar Number already exists.");
    }
    // const io = app.get('socket.io');

    const uuid = await generateUserId();
    const params = {
      uuid,
      is_active: 1,
      user_type_id: type[0].module_assign_id,
      camp_id: req.body.camp_id,
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      middle_name: req.body.middle_name,
      phone: req.body.phone,
      gender: req.body.gender,
      height: req.body.height,
      weight: req.body.weight,
      password: crypto.createHash("md5").update(constants.default_password).digest("hex"),
      address1: req.body.address,
      aadhaar_number: req.body.aadhaar_number,
      language: req.body.language,
      city: req.body.city,
      state: req.body.state,
      country: req.body.country,
      image: req.body.image,
      zip_code: req.body.zip_code,
      date_of_birth: req.body.date_of_birth
    }
    // if(req.body.date_of_birth && req.body.date_of_birth!=''){
    //   params.date_of_birth=req.body.date_of_birth;
    // }
    const createPatient = await db.inputQuery('INSERT INTO users SET ?', params);
    if (!createPatient) {
      return sendResponseInJson(res, 500, "Internal Server Error");
    }
    return sendResponseInJson(res, 201, "Patient added successfully", createPatient);

  } catch (err) {
    // in case of error or exception
    logger.error(PATH_NAME, 'add patient -Error :-', err, ':', __fileName + ':' + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
}
/**
 * @swagger
 * /admin/addAdmin:
 *   post:
 *     tags:
 *       - Admin
 *     description: add user as a admin by admin
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: body
 *         description:  add user as a admin by admin
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             first_name:
 *               type: string
 *             camp_id:
 *               type: string
 *             phone:
 *               type: string
 *             role_type:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       201:
 *         description: admin add successfully
 *       401:
 *         description: Validation error with error obj containing the key
 *       409:
 *         description: admin already exist
 */
module.exports.addAdminController = async function (req, res) {
  logger.info(PATH_NAME, 'Add Admin');
  try {

    const existCamp = await db.execQuery("SELECT camp_id FROM camp_lists WHERE camp_id = '" + req.body.camp_id + "' AND is_active = 1");
    if (existCamp.length <= 0) {
      // logger.error(PATH_NAME, 'invalid camp id:', __line);
      return sendResponseInJson(res, 400, "Please contact administrator to get camp id.");
    }
    const query = "SELECT * FROM users WHERE (email = '" + req.body.email + "' or phone ='" + req.body.phone + "') AND user_type_id NOT in (1,3,4) AND parent_id = 0"

    const existAdmin = await db.execQuery(query);
    if (existAdmin.length > 0) {
      logger.error('admin already exist:', __fileName + ':' + __fileName + ':' + __line);
      return sendResponseInJson(res, 409, "This Email/phone already exist Please try again with another details.");
    }
    const params = {
      uuid: uuidv4(),
      is_active: 1,
      user_type_id: req.body.role_type,
      password: crypto.createHash("md5").update(req.body.password).digest("hex"),
      camp_id: req.body.camp_id,
      email: req.body.email,
      // 			first_last_name:req.body.first_last_name,
      // second_last_name:req.body.second_last_name,
      // date_of_birth:req.body.date_of_birth,
      phone: req.body.phone,
      // 			gender: req.body.gender,
      // 			address1: req.body.address1,
      // 			address2: req.body.address2,
      first_name: req.body.first_name,
      // 			city: req.body.city,
      // 			state: req.body.state
    }
    const createAdmin = await db.inputQuery('INSERT INTO users SET ?', params);
    if (!createAdmin) {
      return sendResponseInJson(res, 500, "Internal Server Error");
    }
    return sendResponseInJson(res, 201, "Admin added successfully", createAdmin);
  } catch (err) {
    // in case of error or exception
    logger.error(PATH_NAME, 'add admin -Error :-', err, ':', __fileName + ':' + __line);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
}

/**
 * @swagger
 * /admin/dashboard/count:
 *   get:
 *     tags:
 *       - camp
 *     description: Return all count user and other
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Return all count user and other
 *
 */

module.exports.allDashboardCount = async function (req, res) {
  logger.info('count for admin dashboard');
  try {
    const curUser = user(req.userDetails);
    // return res.json({
    //   curUser,
    //   roleName: curUser.getRoleName(),
    //   field: curUser.fieldForAppointmentTable()
    // })
    let query;
    if (curUser.fieldForAppointmentTable() === 'super_admin_id' || curUser.fieldForAppointmentTable() === 'admin_id') {
      query = `
        SELECT  
        ( SELECT COUNT(users_id) FROM users where user_type_id = 3 ) AS doctor ,
          ( SELECT COUNT(users_id) FROM users where user_type_id = 4 AND parent_id=0 ) AS patient,
          ( SELECT COUNT(users_id) FROM users where user_type_id  NOT IN (1,3,4,5) ) AS admin,
          ( SELECT COUNT(id) FROM appointments where STATUS ='cancelled') AS c_appointment,
          ( SELECT COUNT(id) FROM user_call_logs where user_call_logs.video_connect = 1) AS Pa_appointment,
          ( SELECT COUNT(id) FROM appointments where date > NOW()) AS up_appointment,
          ( SELECT COUNT(id) FROM appointments ) AS tot_appointment,
          ( SELECT SUM(amount) FROM payments ) AS revenue,
          ( SELECT COUNT(id) FROM camp_lists ) AS camp`;
    } else {
      query = `
      SELECT  
        ${curUser.isNot('DOCTOR') ? '( SELECT COUNT(users_id) FROM users where user_type_id = 3 ) AS doctor ,' : ''}
        ( SELECT COUNT(users_id) FROM users where user_type_id = 4 AND parent_id=0 ) AS patient,
        ( SELECT COUNT(users_id) FROM users where user_type_id  NOT IN (1,3,4,5) ) AS admin,
        ( SELECT COUNT(id) FROM appointments where STATUS ='cancelled' AND ${curUser.fieldForAppointmentTable()} = ${curUser.user_id} ) AS c_appointment,
        ( SELECT COUNT(id) FROM user_call_logs where user_call_logs.video_connect = 1 AND ${curUser.fieldForAppointmentTable()} = ${curUser.user_id} ) AS Pa_appointment,
        ( SELECT COUNT(id) FROM appointments where date > NOW() AND ${curUser.fieldForAppointmentTable()} = ${curUser.user_id} ) AS up_appointment,
        ( SELECT SUM(amount) FROM payments ) AS revenue,
        ( SELECT COUNT(id) FROM camp_lists ) AS camp`;
    }
    // if (req.params.camp_id && req.params.camp_id.trim() != "0") {
    //   query = 'SELECT ( SELECT COUNT(users_id) FROM users where user_type_id = 3 AND users.camp_id= \'' + req.params.camp_id + '\' ) AS doctor, (SELECT COUNT(users_id) FROM users where user_type_id = 4 AND parent_id=0 AND users.camp_id=\'' + req.params.camp_id + '\' ) AS patient,( SELECT COUNT(users_id) FROM users where user_type_id  NOT IN (1,3,4) AND users.camp_id=\'' + req.params.camp_id + '\') AS admin,( SELECT COUNT(id) FROM appointments LEFT join users on users.users_id = appointments.id where STATUS ="cancelled" AND users.camp_id=\'' + req.params.camp_id + '\' ) AS c_appointment,( SELECT COUNT(id) FROM user_call_logs  LEFT join users on users.users_id = user_call_logs.patient_id where user_call_logs.video_connect =1 AND users.camp_id=\'' + req.params.camp_id + '\' ) AS Pa_appointment,( SELECT COUNT(id) FROM appointments LEFT join users on users.users_id = appointments.id where date >  NOW()  AND users.camp_id=\'' + req.params.camp_id + '\'  ) AS up_appointment,( SELECT SUM(amount) FROM payments  LEFT join users on users.users_id = payments.patient_id where users.camp_id=\'' + req.params.camp_id + '\' ) AS revenue,1 AS camp';
    // }
    const allCount = await db.execQuery(query);
    return sendResponseInJson(res, 200, "All Dashboard Count Details", { userDetails: req.userDetails, counts: allCount[0] });
  } catch (err) {
    logger.error('count for admin dashboard -Error :-', err, ':', __fileName + ':' + __line);
    return sendResponseInJson(res, 500, "Internal Server Error", err);
  }
}

