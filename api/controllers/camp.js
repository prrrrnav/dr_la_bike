var camp = function () {};
const config = require("../config/config");
var moment = require("moment-timezone");
var crypto = require("crypto");
var jwt = require("jsonwebtoken");
var logger = require("../middlewares/logger");
var common = require("./common");
var sgMail = require("../helper/sendemail");
var db = require("../helper/database");
var uuidv4 = require("uuid/v4");
var pathName = "Camp file";
var __line;

/**
 * @swagger
 * /camp/createCamp:
 *   post:
 *     tags:
 *       - camp
 *     description: create camp profile
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: step1
 *         description:
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             step:
 *               type: string
 *             parent_id:
 *               type: string
 *             camp_name:
 *               type: string
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zip_code:
 *               type: string
 *             has_portal:
 *               type: string
 *             fax_id:
 *               type: string
 *             tele_phone:
 *               type: string
 *             addational_notes:
 *               type: string
 *             camp_type:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             password:
 *               type: string
 *             role:
 *               type: string
 *             paypal_secret_key:
 *               type: string
 *             amount:
 *               type: string
 *             enable_payment:
 *               type: string
 *     responses:
 *       201:
 *         description: create camp Successfully
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.createCamp = async function (req, res) {
  if (!req.body.step || req.body.step == "") {
    logger.error(
      pathName,
      "Create Camp mandatory field step is required :",
      __line
    );
    return res.status(200).json({
      status_code: 400,
      status_message: "Unmatch process! missing step field.",
    });
  }
  try {
    switch (req.body.step) {
      case "1":
        if (
          !req.body.enable_payment ||
          (req.body.enable_payment &&
            req.body.enable_payment == "1" &&
            (!req.body.amount ||
              req.body.amount == "" ||
              !req.body.paypal_secret_key ||
              req.body.paypal_secret_key == ""))
        ) {
          logger.error(
            pathName,
            "Create Camp mandatory field camp name is required :",
            __line
          );
          return res.status(200).json({
            status_code: 400,
            status_message:
              "Payment Details like paypal secret key and amount invalid.",
          });
        }
        if (!req.body.camp_name || req.body.camp_name == "") {
          logger.error(
            pathName,
            "Create Camp mandatory field camp name is required :",
            __line
          );
          return res.status(200).json({
            status_code: 400,
            status_message: "Organization name is missing.",
          });
        }
        if (
          !req.body.address ||
          req.body.address == "" ||
          !req.body.state ||
          req.body.state == "" ||
          !req.body.city ||
          req.body.city == "" ||
          !req.body.zip_code ||
          req.body.zip_code == ""
        ) {
          logger.error(
            pathName,
            "Create Camp mandatory field all address field  is required :",
            __line
          );
          return res.status(200).json({
            status_code: 400,
            status_message: "Address/city/zip code/state  is missing.",
          });
        }
        if (!req.body.tele_phone || req.body.tele_phone == "") {
          logger.error(
            pathName,
            "Create Camp mandatory fax and telephone no field  is required :",
            __line
          );
          return res.status(200).json({
            status_code: 400,
            status_message: "Tele phone no  is missing.",
          });
        }
        // if (!req.body.has_portal || req.body.has_portal == '' || !req.body.addational_notes || req.body.addational_notes == '') {
        // 	logger.error(pathName, 'Create Camp mandatory website,addational_notes field  is required :', __line);
        // 	return res.status(200).json({ "status_code": 400, "status_message": "Website/addational notes  is missing." });
        // }
        // if (!req.body.name || req.body.name == '' || !req.body.email || req.body.email == '' || common.emailValidation(req.body.email) || !req.body.phone || req.body.phone == '' || common.phoneValidation(req.body.phone) || !req.body.role || req.body.role == '') {
        // 	logger.error(pathName, 'Create Hospital member details all field is required :', __line);
        // 	return res.status(200).json({ "status_code": 400, "status_message": "Member details all field is required." });
        // }
        var existCamp = await db.execQuery(
          "SELECT id  FROM camp_lists  where camp_name = '" +
            req.body.camp_name +
            "' AND tele_phone = '" +
            req.body.tele_phone +
            "'"
        );
        if (existCamp.length > 0) {
          return res.status(200).json({
            status_code: 409,
            status_message:
              "This camp already exist please change camp details",
          });
        }
        // var existUser = await db.exequery('SELECT users_id  FROM users  where ( email = \'' + req.body.email + '\' or phone = \'' + req.body.phone + '\') AND user_type_id = ' + req.body.role);
        // if (existUser.length > 0) {
        // 	return res.status(200).json({ "status_code": 409, "status_message": "This user already exist please change user details" });
        // }
        // req.body.amount = req.body.amount?req.body.amount:'0'
        var paramsCamp = {
          parent_id: req.body.parent_id,
          camp_name: req.body.camp_name,
          // 	fax_id: req.body.fax_id,
          // 	has_portal: req.body.has_portal,
          // 	camp_type: req.body.camp_type,
          camp_id: common.randomRoomNumber(),
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zip_code: req.body.zip_code,
          tele_phone: req.body.tele_phone,
          enable_payment: req.body.enable_payment,
          // 	amount: req.body.amount,
          // 	paypal_secret_key: req.body.paypal_secret_key,
          // 	addational_notes: req.body.addational_notes
        };
        var insertCamp = await db.inputQuery(
          "INSERT INTO camp_lists SET ?",
          paramsCamp
        );
        if (insertCamp.affectedRows > 0) {
          // 	var paramsUser = {
          // 		uuid: uuidv4(),
          // 		name: req.body.name,
          // 		email: req.body.email,
          // 		phone: req.body.phone,
          // 		user_type_id: req.body.role,
          // 		camp_id: paramsHospital.camp_id
          // 	}
          // 	insertuser = await db.inupquery('INSERT INTO users SET ?', paramsUser);
          // 	if (insertuser.affectedRows > 0) {
          // 	var updateuser = await db.exequery('UPDATE camp_lists SET users_id =\'' + insertuser.insertId + '\' WHERE camp_id =\'' + paramsUser.camp_id + '\'');
          // 		req.body.camp_id = paramsUser.camp_id;
          // 		req.body.id = insertuser.insertId;
          // 		var msg = {
          // 			from: 'Desh Clinic <' + config.sendgrid.sendgridemail + '>',
          // 			to: req.body.email,
          // 			subject: "Reset Your Password",
          // 			html: common.resetPasswordHospitalTemplate(req.body)
          // 		};
          // 		var sendEmail = await sgMail.send(msg);
          // 		if (sendEmail[0].statusCode == 202) {
          return res.status(200).json({
            status_code: 200,
            status_message: "New Clinic Registered Successfully.",
          });
          // 		} else {
          // 			return res.status(200).json({ "status_code": 200, "status_message": "Something went wrong in sending email." });
          // 		}
          // 	}
          // 	return res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
        } else {
          return res.status(200).json({
            status_code: 500,
            status_message: "Internal Server Error",
          });
        }
        break;
      default:
        //step not found
        logger.error(pathName, "step did not match", __line);
        res
          .status(200)
          .json({ status_code: 400, status_message: "Process step not match" });
    }
  } catch (err) {
    // in case of error or exception
    logger.error(pathName, "create camp -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /camp/update/:camp_id:
 *   put:
 *     tags:
 *       - camp
 *     description: update camp profile
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         description:
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zip_code:
 *               type: string
 *             tele_phone:
 *               type: string
 *             enable_payment:
 *               type: string
 *             name:
 *               type: string
 *     responses:
 *       200:
 *         description: Update Camp Successfully
 *       404:
 *         description: Camp doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.updateCamp = async function (req, res) {
  try {
    if (!req.body.enable_payment) {
      logger.error(
        pathName,
        "Create Camp mandatory field camp name is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message:
          "Payment Details like paypal secret key and amount invalid.",
      });
    }
    if (
      !req.body.address ||
      req.body.address == "" ||
      !req.body.state ||
      req.body.state == "" ||
      !req.body.city ||
      req.body.city == "" ||
      !req.body.zip_code ||
      req.body.zip_code == ""
    ) {
      logger.error(
        pathName,
        "Update Camp mandatory field all address field  is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Address/city/zip code/state  is missing.",
      });
    }
    if (!req.body.tele_phone || req.body.tele_phone == "") {
      logger.error(
        pathName,
        "Update Camp mandatory fax and telephone no field  is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Tele phone no  is missing.",
      });
    }
    // 		if (!req.body.has_portal || req.body.has_portal == '' || !req.body.addational_notes || req.body.addational_notes == '') {
    // 			logger.error(pathName, 'Update Camp mandatory website,addational_notes field  is required :', __line);
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Website/addational_notes  is missing." });
    // 		}
    if (!req.params.camp_id || req.params.camp_id == "") {
      logger.error(
        pathName,
        "Update Camp mandatory camp_id field  is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Camp id  is missing." });
    }
    if (!req.body.camp_name || req.body.camp_name == "") {
      logger.error(
        pathName,
        "Update Camp mandatory name field  is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Name is missing." });
    }

    // 		req.body.amount = req.body.amount?req.body.amount:'0'
    var params = {
      // 			fax_id: req.body.fax_id,
      // 			has_portal: req.body.has_portal,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip_code: req.body.zip_code,
      tele_phone: req.body.tele_phone,
      // 			addational_notes: req.body.addational_notes,
      enable_payment: req.body.enable_payment,
      // 			amount: req.body.amount,
      // 			paypal_secret_key: req.body.paypal_secret_key,
      camp_name: req.body.camp_name,
    };
    var updateCamp = await db.inputQuery(
      "UPDATE camp_lists SET ? WHERE camp_id =" + req.params.camp_id,
      params
    );
    if (updateCamp.affectedRows > 0) {
      return res.status(200).json({
        status_code: 200,
        status_message: "Camp updated successfully.",
      });
    }
    return res
      .status(200)
      .json({ status_code: 404, status_message: "Camp doesn't exist." });
  } catch (err) {
    logger.error(pathName, "Camp update -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /camp/Search/:page/:limit/:name:
 *   get:
 *     tags:
 *       - camp
 *     description: search a Camp by it's name and address
 *     responses:
 *       200:
 *         description: get a Camp list successfully
 *       404:
 *         description: Camp doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.search = async function (req, res) {
  var limit = req.params.limit;
  var offset = req.params.page > 0 ? req.params.page - 1 : 0;
  logger.info(pathName, "Camp search");
  try {
    req.params.name = req.params.name || "";
    var sql =
      "SELECT * FROM camp_lists WHERE is_active = 1 AND (camp_name LIKE '%" +
      req.params.name +
      "%' or address LIKE '%" +
      req.params.name +
      "%' or city LIKE '%" +
      req.params.name +
      "%' or state LIKE '%" +
      req.params.name +
      "%') ORDER BY id DESC limit " +
      limit +
      " offset " +
      limit * offset;
    var existCamp = await db.execQuery(sql);
    if (existCamp.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Camp Search Results",
        result: existCamp,
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "There  are no Camp available",
      });
    }
  } catch (err) {
    logger.error(pathName, "Camp search -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /camp/allList/:page/:limit:
 *   get:
 *     tags:
 *       - camp
 *     description: Return all Camp list
 *     responses:
 *       200:
 *         description: All Camp List
 *       404:
 *         description: Camp list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
camp.allList = async function (req, res) {
  logger.info(pathName, "All Camp list");
  try {
    var limit = req.params.limit;
    var offset = req.params.page > 0 ? req.params.page - 1 : 0;
    var allCamp = await db.execQuery(
      "SELECT camp_lists.* from camp_lists ORDER BY camp_lists.id DESC limit " +
        limit +
        " offset " +
        limit * offset
    );
    if (allCamp.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "All Camp List",
        result: allCamp,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "No Camp found" });
    }
  } catch (err) {
    logger.error(pathName, "Camp -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /camp/:camp_id:
 *   get:
 *     tags:
 *       - camp
 *     description: Return a Camp
 *     responses:
 *       200:
 *         description: Camp
 *       404:
 *         description: Camp doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
camp.getCampById = async function (req, res) {
  logger.info(pathName, "Camp");
  try {
    var camp = await db.execQuery(
      "SELECT camp_lists.*,users.phone as users_phone,users.email as users_email,users.name as users_name from camp_lists LEFT JOIN users ON users.users_id = camp_lists.users_id where camp_lists.camp_id = '" +
        req.params.camp_id +
        "'"
    );
    if (camp.length > 0) {
      res
        .status(200)
        .json({ status_code: 200, status_message: "Camp", result: camp[0] });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "No Camp found" });
    }
  } catch (err) {
    logger.error(pathName, "Camp -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /camp/activeInactive/:camp_id:
 *   put:
 *     tags:
 *       - camp
 *     description: update camp status
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update camp status
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: number // active for 1 or inactive for 2
 *     responses:
 *       200:
 *         description: Update camp Status Successfully
 *       404:
 *         description:  Camp doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.updateCampStatus = async function (req, res) {
  logger.info(pathName, "Update Camp Status");
  try {
    if (!req.params.camp_id || req.params.camp_id == "") {
      logger.error(
        pathName,
        "Update camp Status mandatory field specialities camp id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Camp id is missing for update camp active/inactive .",
      });
    }
    // 		if (!req.body.status || req.body.status.trim() == '') {
    // 			logger.error(pathName, 'update hospital Status mandatory field hospital status is required :', __line);
    // 			return res.status(200).json({ "status_code": 400, "status_message": "Hospital status is missing for update hospital active/inactive ." });
    // 		}
    req.body.status = req.body.status == 1 ? 0 : 1;
    var params = {
      is_active: req.body.status,
    };
    var updateCamp = await db.inputQuery(
      "UPDATE camp_lists SET ? WHERE camp_id ='" + req.params.camp_id + "'",
      params
    );
    if (updateCamp.affectedRows > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Camp Status Updated Successfully",
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "Camp doesn't exist" });
    }
  } catch (err) {
    logger.error(pathName, "update Camp Status -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /specialities/create:
 *   post:
 *     tags:
 *       - camp
 *     description: create speciality
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: create speciality
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *     responses:
 *       201:
 *         description: speciality add successfully
 *       409:
 *         description: speciality already exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.createSpeciality = async function (req, res) {
  logger.info(pathName, "Create Speciality ");
  try {
    if (!req.body.name || req.body.name == "") {
      logger.error(
        pathName,
        "Create Speciality mandatory field name is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Name is required." });
    }
    var specialityExist = await db.execQuery(
      "SELECT * FROM specialities WHERE name = '" + req.body.name + "'"
    );
    if (specialityExist.length > 0) {
      return res
        .status(200)
        .json({ status_code: 409, status_message: "Speciality already Exist" });
    } else {
      var params = {
        name: req.body.name,
        is_active: 1,
      };
      var createSpecialitys = await db.inputQuery(
        "INSERT INTO specialities SET ?",
        params
      );
      if (createSpecialitys) {
        return res.status(200).json({
          status_code: 201,
          status_message: "Speciality created successfully",
          result: createSpecialitys,
        });
      } else {
        return res
          .status(200)
          .json({ status_code: 500, status_message: "Internal Server Error" });
      }
    }
  } catch (err) {
    logger.error(pathName, "add Speciality  -Error :-", err, ":", __line);
    return res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /admin/speciality:
 *   get:
 *     tags:
 *       - camp
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
camp.specialityallList = async function (req, res) {
  logger.info(pathName, "All specialities list");
  try {
    var allspeciality = await db.execQuery(
      "SELECT * from specialities  ORDER BY id DESC "
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
 * /specialities/activeInactive/:id:
 *   put:
 *     tags:
 *       - camp
 *     description: update specialities status
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update specialities status
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: number // active for 1 or inactive for 2
 *     responses:
 *       200:
 *         description: Update specialities Status Successfully
 *       404:
 *         description:  specialities doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.updateSpecialityStatus = async function (req, res) {
  logger.info(pathName, "update specialities Status");
  try {
    if (!req.params.id || req.params.id == "") {
      logger.error(
        pathName,
        "update specialities Status mandatory field specialities id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message:
          "speciality id is missing for update specialities active/inactive .",
      });
    }
    // 		if (!req.body.status || req.body.status.trim() == '') {
    // 			logger.error(pathName, 'update specialities Status mandatory field specialities status is required :', __line);
    // 			return res.status(200).json({ "status_code": 400, "status_message": "speciality status is missing for update specialities active/inactive ." });
    // 		}
    req.body.status = req.body.status == 1 ? 0 : 1;
    var params = {
      is_active: req.body.status,
    };
    var updatespeciality = await db.inputQuery(
      "UPDATE specialities SET ? WHERE id ='" + req.params.id + "'",
      params
    );
    if (updatespeciality.affectedRows > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Speciality Status updated Successfully",
      });
    } else {
      res
        .status(200)
        .json({ status_code: 500, status_message: "Internal Server Error" });
    }
  } catch (err) {
    logger.error(
      pathName,
      "update specialities Status -Error :-",
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
 * /user/activeInactive/:id:
 *   put:
 *     tags:
 *       - camp
 *     description: update user status
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update user status
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: number // active for 1 or inactive for 2
 *     responses:
 *       200:
 *         description: Updated user Status Successfully
 *       404:
 *         description:  user doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.updateUserStatus = async function (req, res) {
  logger.info(pathName, "update user Status");
  try {
    if (!req.params.id || req.params.id == "") {
      logger.error(
        pathName,
        "update user Status mandatory field user id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "user id is missing for update user active/inactive.",
      });
    }
    // 		if (!req.body.status || req.body.status.trim() == '') {
    // 			logger.error(pathName, 'update specialities Status mandatory field specialities status is required :', __line);
    // 			return res.status(200).json({ "status_code": 400, "status_message": "speciality status is missing for update specialities active/inactive ." });
    // 		}
    req.body.status = req.body.status == 1 ? 0 : 1;
    var params = {
      is_active: req.body.status,
    };
    var updateUser = await db.inputQuery(
      "UPDATE users SET ? WHERE users_id ='" + req.params.id + "'",
      params
    );
    if (updateUser.affectedRows > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "User Status updated Successfully",
      });
    } else {
      res
        .status(200)
        .json({ status_code: 500, status_message: "Internal Server Error" });
    }
  } catch (err) {
    logger.error(pathName, "update user Status -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /specialities/delete/:id:
 *   delete:
 *     tags:
 *       - camp
 *     description: delete specialitie
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: delete specialitie
 *     responses:
 *       200:
 *         description:delete specialitie Successfully
 *       404:
 *         description:  specialitie doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.deleteSpeciality = async function (req, res) {
  logger.info(pathName, "delete specialitie");
  try {
    if (!req.params.id || req.params.id == "") {
      logger.error(
        pathName,
        "delete specialitie Status mandatory field specialities id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "speciality id is missing for delete specialitie.",
      });
    }
    // 		if (!req.body.status || req.body.status.trim() == '') {
    // 			logger.error(pathName, 'update specialities Status mandatory field specialities status is required :', __line);
    // 			return res.status(200).json({ "status_code": 400, "status_message": "speciality status is missing for update specialities active/inactive ." });
    // 		}
    var updatespeciality = await db.inputQuery(
      "DELETE  FROM specialities WHERE id ='" + req.params.id + "'"
    );
    if (updatespeciality.affectedRows > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Speciality Deleted Successfully",
      });
    } else {
      res
        .status(200)
        .json({ status_code: 500, status_message: "Internal Server Error" });
    }
  } catch (err) {
    logger.error(
      pathName,
      "delete  specialitie Status -Error :-",
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
 * /user/delete/:id:
 *   delete:
 *     tags:
 *       - camp
 *     description: delete user
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: delete user
 *     responses:
 *       200:
 *         description:delete user Successfully
 *       404:
 *         description:  user doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.deleteUser = async function (req, res) {
  logger.info(pathName, "delete user");
  try {
    if (!req.params.id || req.params.id == "") {
      logger.error(
        pathName,
        "delete user Status mandatory field specialities id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "user id is missing for delete user.",
      });
    }
    // 		if (!req.body.status || req.body.status.trim() == '') {
    // 			logger.error(pathName, 'update specialities Status mandatory field specialities status is required :', __line);
    // 			return res.status(200).json({ "status_code": 400, "status_message": "speciality status is missing for update specialities active/inactive ." });
    // 		}
    var deleteUser = await db.inputQuery(
      "DELETE  FROM users WHERE users_id ='" + req.params.id + "'"
    );
    if (deleteUser.affectedRows > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "user Deleted Successfully",
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "User doesn`t exist" });
    }
  } catch (err) {
    logger.error(pathName, "delete  user Status -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /appointment/delete/:id:
 *   delete:
 *     tags:
 *       - camp
 *     description: delete appointment
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: delete appointment
 *     responses:
 *       200:
 *         description:delete appointment Successfully
 *       404:
 *         description:  appointment doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.deleteAppointment = async function (req, res) {
  logger.info(pathName, "delete appointment");
  try {
    if (!req.params.id || req.params.id == "") {
      logger.error(
        pathName,
        "delete user Status mandatory field appointment id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "appointment id is missing for delete appointment.",
      });
    }
    // 		if (!req.body.status || req.body.status.trim() == '') {
    // 			logger.error(pathName, 'update specialities Status mandatory field specialities status is required :', __line);
    // 			return res.status(200).json({ "status_code": 400, "status_message": "speciality status is missing for update specialities active/inactive ." });
    // 		}
    var deleteAppointment = await db.inputQuery(
      "DELETE  FROM appointments WHERE id ='" + req.params.id + "'"
    );
    if (deleteAppointment.affectedRows > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Appointment Deleted Successfully",
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "Appointment doesn`t exist",
      });
    }
  } catch (err) {
    logger.error(
      pathName,
      "delete  appointment Status -Error :-",
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
 * /camp/delete/:camp_id:
 *   delete:
 *     tags:
 *       - camp
 *     description: delete camp
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: delete camp
 *     responses:
 *       200:
 *         description:delete camp Successfully
 *       404:
 *         description:  camp doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.deleteCamp = async function (req, res) {
  logger.info(pathName, "delete camp");
  try {
    if (!req.params.camp_id || req.params.camp_id == "") {
      logger.error(
        pathName,
        "delete user Status mandatory field camp id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "camp id is missing for delete camp.",
      });
    }
    // 		if (!req.body.status || req.body.status.trim() == '') {
    // 			logger.error(pathName, 'update specialities Status mandatory field specialities status is required :', __line);
    // 			return res.status(200).json({ "status_code": 400, "status_message": "speciality status is missing for update specialities active/inactive ." });
    // 		}
    console.log("camp_id", req.params.camp_id);
    var deleteCamp = await db.inputQuery(
      "DELETE FROM camp_lists WHERE id ='" + req.params.camp_id + "'"
    );
    if (deleteCamp.affectedRows > 0) {
      // await db.inputQuery('DELETE FROM users WHERE camp_id =\'' + req.params.camp_id + '\'');
      res.status(200).json({
        status_code: 200,
        status_message: "Camp deleted successfully",
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "Camp doesn`t exist" });
    }
  } catch (err) {
    logger.error(
      pathName,
      "delete  appointment Status -Error :-",
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
 * /specialities/update/:id:
 *   put:
 *     tags:
 *       - camp
 *     description: update specialities
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: update specialities
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *     responses:
 *       200:
 *         description: Update specialities Successfully
 *       404:
 *         description:  specialities doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.updateSpeciality = async function (req, res) {
  logger.info(pathName, "update specialities");
  try {
    if (!req.params.id || req.params.id == "") {
      logger.error(
        pathName,
        "update specialities mandatory field specialities id is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Speciality id is missing for update specialities.",
      });
    }
    if (!req.body.name || req.body.name.trim() == "") {
      logger.error(
        pathName,
        "update specialities mandatory field specialities name is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Speciality name is missing for update specialities.",
      });
    }
    var existSpec = await db.execQuery(
      "SELECT id from specialities where name = '" + req.body.name + "'"
    );
    if (existSpec.length > 0) {
      logger.error(
        pathName,
        "update specialities name is already exist :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Speciality name is already exist.",
      });
    }
    var params = {
      name: req.body.name,
    };
    var updatespeciality = await db.inputQuery(
      "UPDATE specialities SET ? WHERE id ='" + req.params.id + "'",
      params
    );
    if (updatespeciality.affectedRows > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Speciality updated Successfully",
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "Speciality doesn't exist" });
    }
  } catch (err) {
    logger.error(pathName, "update specialities -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /recently/adduser/:camp_id/type:
 *   get:
 *     tags:
 *       - camp
 *     description: get recently add user list based on camp
 *     produces:
 *       - application/x-www-form-urlencoded
 *     responses:
 *       200:
 *         description: get recently add user list Successfully
 *       404:
 *         description: recently add user list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.recentlyadduserList = async function (req, res) {
  logger.info(pathName, "Get add recent user List", req.params.camp_id);
  try {
    var type = await db.execQuery(
      "SELECT module_assign_id FROM module_assign WHERE role = '" +
        req.params.type +
        "'"
    );
    if (type.length <= 0) {
      logger.error(pathName, "check user type exist:", __line);
      return res.status(200).json({
        status_code: 400,
        status_message: "Please contact administrator for creating user type.",
      });
    }
    var query = "SELECT * FROM users";
    if (req.params.camp_id && req.params.camp_id.trim() != "0") {
      query = query + " where camp_id = '" + req.params.camp_id + "' AND";
    } else {
      query = query + " where ";
    }

    query =
      query +
      " user_type_id = '" +
      type[0].module_assign_id +
      "' ORDER BY users_id DESC  limit 4";
    var userList = await db.execQuery(query);
    if (userList.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Get user List successfully",
        result: userList,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "User list Doesn't exist" });
    }
  } catch (err) {
    logger.error(pathName, "Get user List -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /patient/callLogs/:page/:limit/:patient_id:
 *   get:
 *     tags:
 *       - camp
 *     description: Return all call logs by patient id
 *     parameters:
 *       - name: id
 *         description: camp id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: All call logs list  by a patient id
 *       404:
 *         description: Call logs list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
camp.callLogsListbypatient = async function (req, res) {
  logger.info(pathName, "Call logs patient id", req.params.patient_id);
  if (!req.params.patient_id || req.params.patient_id == "") {
    logger.error(
      pathName,
      "call logs mandatory field patient id is required:",
      __line
    );
    return res.status(200).json({
      status_code: 400,
      status_message: "Patient id is missing for get past appointment.",
    });
  }
  try {
    var limit = req.params.limit || 10;
    var offset = req.params.page > 0 ? req.params.page - 1 : 0;
    var query =
      "SELECT user_call_logs.id as call_id,camp_lists.camp_name,user_call_logs.*,users.name as d_name,users.email as d_email,users.phone as d_phone,u.name as p_name,u.email as p_email,u.phone as p_phone FROM user_call_logs LEFT JOIN users ON user_call_logs.doctor_id = users.users_id LEFT JOIN camp_lists ON camp_lists.camp_id = users.camp_id LEFT JOIN users as u ON user_call_logs.patient_id = u.users_id  where user_call_logs.video_connect =1";
    if (req.params.patient_id && req.params.patient_id.trim() != "0") {
      query = query + " AND user_call_logs.patient_id=" + req.params.patient_id;
    }
    query =
      query +
      " ORDER BY user_call_logs.created_at DESC limit " +
      limit +
      " offset " +
      limit * offset;
    var callDetails = await db.execQuery(query);
    if (callDetails.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "All call logs List",
        result: callDetails,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "No call logs found" });
    }
  } catch (err) {
    logger.error(pathName, "call logs -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /patient/medicalHistory/:patient_id:
 *   get:
 *     tags:
 *       - camp
 *     description: Return medical history by patient id
 *     parameters:
 *       - name: id
 *         description: patient id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: All medical history  by a patient id
 *       404:
 *         description: medical history doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
camp.medicalHistoryByPatientId = async function (req, res) {
  logger.info(pathName, "medical history patient id", req.params.patient_id);
  if (!req.params.patient_id || req.params.patient_id == "") {
    logger.error(
      pathName,
      "call logs mandatory field patient id is required:",
      __line
    );
    return res.status(200).json({
      status_code: 400,
      status_message: "Patient id is missing for get past appointment.",
    });
  }
  try {
    var query =
      "SELECT symptoms,allergies,medications  FROM user_call_logs  where user_call_logs.video_connect =1";
    if (req.params.patient_id && req.params.patient_id.trim() != "0") {
      query = query + " AND user_call_logs.patient_id=" + req.params.patient_id;
    }
    query = query + " ORDER BY user_call_logs.created_at DESC limit 1";
    var medicalHistory = await db.execQuery(query);
    if (medicalHistory.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Medical history",
        result: medicalHistory[0],
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "No Medical history found" });
    }
  } catch (err) {
    logger.error(pathName, "medical History -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /admin/callLogs/:page/:limit/:camp_id:
 *   get:
 *     tags:
 *       - camp
 *     description: Return all call logs by camp id
 *     parameters:
 *       - name: id
 *         description: camp id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: All call logs list  by a camp id
 *       404:
 *         description: Call logs list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
camp.callLogsList = async function (req, res) {
  logger.info(pathName, "Call logs camp id", req.params.camp_id);
  if (!req.params.camp_id || req.params.camp_id == "") {
    logger.error(
      pathName,
      "call logs mandatory field camp id is required:",
      __line
    );
    return res.status(200).json({
      status_code: 400,
      status_message: "Camp id is missing for get past appointment.",
    });
  }
  try {
    var limit = req.params.limit || 20;
    var offset = req.params.page > 0 ? req.params.page - 1 : 0;
    var query =
      "SELECT user_call_logs.id as call_id,camp_lists.camp_name,user_call_logs.*,users.name as d_name,users.email as d_email,users.phone as d_phone,u.name as p_name,u.email as p_email,u.phone as p_phone FROM user_call_logs LEFT JOIN users ON user_call_logs.doctor_id = users.users_id LEFT JOIN camp_lists ON camp_lists.camp_id = users.camp_id LEFT JOIN users as u ON user_call_logs.patient_id = u.users_id  where user_call_logs.video_connect =1";
    if (req.params.camp_id && req.params.camp_id.trim() != "0") {
      query = query + " AND users.camp_id=" + req.params.camp_id;
    }
    query =
      query +
      " ORDER BY user_call_logs.created_at DESC limit " +
      limit +
      " offset " +
      limit * offset;
    var callDetails = await db.execQuery(query);
    if (callDetails.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "All call logs List",
        result: callDetails,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "No call logs found" });
    }
  } catch (err) {
    logger.error(pathName, "call logs -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};
/**
 * @swagger
 * /admin/dashboard/count/:camp_id:
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
camp.allDashboardCount = async function (req, res) {
  logger.info(pathName, "count for admin dashboard");
  try {
    const query =
      "SELECT ( SELECT COUNT(users_id) FROM users where user_type_id = 3 ) AS doctor, (SELECT COUNT(users_id) FROM users where user_type_id = 4 AND parent_id=0 ) AS patient,( SELECT COUNT(users_id) FROM users where user_type_id  NOT IN (1,3,4,5)) AS admin,( SELECT COUNT(id) FROM appointments where STATUS ='cancelled') AS c_appointment,( SELECT COUNT(id) FROM user_call_logs where user_call_logs.video_connect =1 ) AS Pa_appointment,( SELECT COUNT(id) FROM appointments where date >  NOW() ) AS up_appointment,( SELECT SUM(amount) FROM payments ) AS revenue,( SELECT COUNT(id) FROM camp_lists ) AS camp";
    // if (req.params.camp_id && req.params.camp_id.trim() != "0") {
    //   query = 'SELECT ( SELECT COUNT(users_id) FROM users where user_type_id = 3 AND users.camp_id= \'' + req.params.camp_id + '\' ) AS doctor, (SELECT COUNT(users_id) FROM users where user_type_id = 4 AND parent_id=0 AND users.camp_id=\'' + req.params.camp_id + '\' ) AS patient,( SELECT COUNT(users_id) FROM users where user_type_id  NOT IN (1,3,4) AND users.camp_id=\'' + req.params.camp_id + '\') AS admin,( SELECT COUNT(id) FROM appointments LEFT join users on users.users_id = appointments.id where STATUS ="cancelled" AND users.camp_id=\'' + req.params.camp_id + '\' ) AS c_appointment,( SELECT COUNT(id) FROM user_call_logs  LEFT join users on users.users_id = user_call_logs.patient_id where user_call_logs.video_connect =1 AND users.camp_id=\'' + req.params.camp_id + '\' ) AS Pa_appointment,( SELECT COUNT(id) FROM appointments LEFT join users on users.users_id = appointments.id where date >  NOW()  AND users.camp_id=\'' + req.params.camp_id + '\'  ) AS up_appointment,( SELECT SUM(amount) FROM payments  LEFT join users on users.users_id = payments.patient_id where users.camp_id=\'' + req.params.camp_id + '\' ) AS revenue,1 AS camp';
    // }
    const allCount = await db.execQuery(query);
    res.status(200).json({
      status_code: 200,
      status_message: "All Dashboard Count Details",
      result: allCount[0],
    });
  } catch (err) {
    logger.error(
      pathName,
      "count for admin dashboard -Error :-",
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
 * /admin/forgot/password/:email:
 *   post:
 *     tags:
 *       - camp
 *     description: forgot password
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: forgot password
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
// camp.forgotPassword = async function (req, res) {
// 	try {
// 		if (!req.params.email || req.params.email == '') {
// 			logger.error(pathName, 'Forgot password mandatory field email is required :', __line);
// 			return res.status(200).json({ "status_code": 400, "status_message": "Email/Phone is missing." });
// 		}
// 		var existUser = await db.exequery('SELECT users_id,camp_id,user_type_id  FROM users  where ( email = \'' + req.params.email + '\' or phone = \'' + req.params.email + '\' ) AND user_type_id NOT IN (3,4)');
// 		if (existUser.length > 0) {
// 		    var obj ={
// 		        id:existUser[0].users_id,
// 		        camp_id:existUser[0].camp_id,
// 		        role:existUser[0].user_type_id
// 		    }
// 		var msg = {
// 			from: 'Desh Clinic <' + config.sendgrid.sendgridemail + '>',
// 			to: req.params.email,
// 			subject: "Reset Your Password",
// 			html: common.resetPasswordCampTemplate(obj)
// 		};
// 		var sendEmail = await sgMail.send(msg);
// 		if (sendEmail[0].statusCode == 202) {
// 			return res.status(200).json({ "status_code": 200, "status_message": "Email send successfully for reset password." });
// 		} else {
// 			return res.status(200).json({ "status_code": 200, "status_message": "Something went wrong in sending email." });
// 		}
// 		}else{
// 		    return res.status(200).json({ "status_code": 400, "status_message": "Invalid email address please check and try again." });
// 		}
// 	} catch (err) {
// 		// in case of error or exception
// 		logger.error(pathName, 'Forgot password -Error :-', err, ':', __line);
// 		res.status(200).json({ "status_code": 500, "status_message": "Internal Server Error" });
// 	}
// }
camp.forgotPassword = async function (req, res) {
  try {
    if (!req.params.email || req.params.email == "") {
      logger.error(
        pathName,
        "Forgot password mandatory field email is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Email/Phone is missing." });
    }
    if (!req.body.role || req.body.role == "") {
      logger.error(
        pathName,
        "Forgot password mandatory field role is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Role is missing." });
    }
    const role = req.body.role;
    const email = req.params.email;
    const module = "FORGOT_PASSWORD";
    // Save otp to database
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
    var existUser = await db.execQuery(
      "SELECT users_id,camp_id,user_type_id,app_language, first_name, middle_name, last_name FROM users where ( email = '" +
        req.params.email +
        "' or phone = '" +
        req.params.email +
        "' ) AND user_type_id ='" +
        role +
        "' "
    ); // AND user_type_id NOT IN (3,4)
    if (existUser.length > 0) {
      var emailtitle = "Verification Code";
      var emaillang = "en";
      // if (existUser[0].app_language && existUser[0].app_language == 'es') {
      //   emailtitle = "Actualiza tu contraseña en Dr. LaBike";
      //   emaillang = "es"
      // }
      var obj = {
        id: existUser[0].users_id,
        camp_id: existUser[0].camp_id,
        role: existUser[0].user_type_id,
        name:
          existUser[0].first_name + " " ||
          "" + existUser[0].middle_name + " " ||
          "" + existUser[0].last_name ||
          "",
        otp: insertOtp.otp,
      };
      var msg = {
        from: "Dr. LaBike <" + config.sendgrid.sendgridemail + ">",
        to: req.params.email,
        subject: emailtitle,
        html: common.resetPasswordCampTemplate(obj, emaillang),
      };
      var sendEmail = await sgMail.send(msg);
      if (sendEmail[0].statusCode != 202) {
        return sendResponseInJson(res, 500, "Internal Server Error");
      }
      insertOtp.email = email;
      const insertOtpEmail = await db.inputQuery(
        "INSERT INTO verification_codes SET ?",
        insertOtp
      );
      if (!insertOtpEmail) {
        return sendResponseInJson(res, 500, "Internal server error");
      }
      return sendResponseInJson(
        res,
        200,
        "OTP sent to your email successfully!"
      );
      // if (sendEmail[0].statusCode == 202) {
      // return res.status(200).json({
      //   "status_code": 200,
      //   "status_message": "Email send successfully for reset password."
      // });
      // } else {
      //   return res.status(200).json({ "status_code": 200, "status_message": "Something went wrong in sending email." });
      // }
    } else {
      return res.status(200).json({
        status_code: 400,
        status_message: "Invalid email address please check and try again.",
      });
    }
  } catch (err) {
    // in case of error or exception
    logger.error(pathName, "Forgot password -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};
/**
 * @swagger
 * /camp/createPdf:
 *   post:
 *     tags:
 *       - camp
 *     description: create  pdf
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: step1
 *         description:
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             doctor_id:
 *               type: string
 *             patient_id:
 *               type: string
 *             email:
 *               type: string
 *             call_id:
 *               type: string
 *             diagnostic:
 *               type: string
 *             medicine:
 *               type: string
 *             indications_and_notes:
 *               type: string
 *             conditions_previous:
 *               type: string
 *             height:
 *               type: string
 *             weight:
 *               type: string
 *             institute:
 *               type: string
 *     responses:
 *       200:
 *         description: create pdf Successfully
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
var pdf = require("pdf-creator-node");
var fs = require("fs");
const { sendResponseInJson } = require("../utils/utils");
const { generatePdf } = require("../helper/pdf");

// Read HTML Template

camp.createPdf = async function (req, res) {
  try {
    // console.log(req.body);
    if (!req.body.email || (req.body.email && req.body.email.trim() == "")) {
      // logger.error(pathName, 'Create pdf mandatory field email is required :', __line);
      return res.status(200).json({
        status_code: 400,
        status_message: "Required email field for verification",
      });
    }
    if (common.emailValidation(req.body.email)) {
      // logger.error(pathName, 'Create pdf mandatory field email is required :', __line);
      return res.status(200).json({
        status_code: 400,
        status_message: "Invalid email. Please check and try again.",
      });
    }
    if (!req.body.call_id || req.body.call_id == 0) {
      // logger.error(pathName, 'Create pdf mandatory field call id is required :', __line);
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Required call id field." });
    }
    if (
      !req.body.doctor_id ||
      (req.body.doctor_id && req.body.doctor_id.trim() == "")
    ) {
      // logger.error(pathName, 'Create pdf mandatory field doctor id is required :', __line);
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Doctor is missing." });
    }
    if (!req.body.patient_id) {
      // logger.error(pathName, 'Create pdf mandatory field patient id is required :', __line);
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Patient is missing." });
    }
    //    if (!req.body.diagnostic || (req.body.diagnostic && req.body.diagnostic.trim() == '')) {
    //     logger.error(pathName, 'Create pdf mandatory field diagnostic is required :', __line);
    //     return res.status(200).json({ "status_code": 400, "status_message": "Diagnostic is missing." });
    //    }
    //    if (!req.body.medicine || (req.body.medicine && req.body.medicine.trim() == '')) {
    //     logger.error(pathName, 'Create pdf mandatory field medicine id is required :', __line);
    //     return res.status(200).json({ "status_code": 400, "status_message": "Medicine is missing." });
    //    }
    //    if (!req.body.treatment || (req.body.treatment && req.body.treatment.trim() == '')) {
    //     logger.error(pathName, 'Create pdf mandatory field treatment is required :', __line);
    //     return res.status(200).json({ "status_code": 400, "status_message": "Treatment is missing." });
    //    }
    //    if (!req.body.indications_and_notes || (req.body.indications_and_notes && req.body.indications_and_notes.trim() == '')) {
    //     logger.error(pathName, 'Create pdf mandatory field indications_and_notes is required :', __line);
    //     return res.status(200).json({ "status_code": 400, "status_message": "Indications of use and notes is missing." });
    //    }
    var pdfdata = req.body;
    var existDocotr = await db.execQuery(
      "SELECT users.*,GROUP_CONCAT(specialities.name) as s_name FROM users LEFT JOIN specialities ON FIND_IN_SET(specialities.id, users.speciality) WHERE users.users_id = '" +
        req.body.doctor_id +
        "' AND users.is_active = 1 GROUP BY users_id"
    );
    if (existDocotr.length > 0) {
      pdfdata.d_name =
        (existDocotr[0].title || "Dr") +
        " " +
        existDocotr[0].first_name +
        " " +
        (existDocotr[0].middle_name ? existDocotr[0].middle_name + " " : "") +
        (existDocotr[0].last_name ? existDocotr[0].last_name : "");
      pdfdata.speciality = existDocotr[0].s_name;
      pdfdata.d_email = existDocotr[0].email;
      pdfdata.d_phone = existDocotr[0].phone;
      pdfdata.d_license = existDocotr[0].national_licence;
      pdfdata.d_instute = req.body.institute;
      pdfdata.certficate = existDocotr[0].professional_cert_no;
      pdfdata.h_name = existDocotr[0].camp_name;
      pdfdata.h_phone = existDocotr[0].tele_phone;
      pdfdata.h_state = existDocotr[0].state;
      pdfdata.h_address = existDocotr[0].address;
      pdfdata.h_city = existDocotr[0].city;
    } else {
      return res
        .status(200)
        .json({ status_code: 404, status_message: "Doctor doesn't exist" });
    }
    var emailtitle = "Your e-Prescription has been generated";
    var emaillang = "en";
    var existPatient = await db.execQuery(
      "SELECT users.*,timestampdiff(YEAR,date_of_birth,now()) AS age FROM users  WHERE users.users_id = '" +
        req.body.patient_id +
        "' AND users.is_active = 1"
    );
    // console.log(existPatient);
    if (existPatient.length > 0) {
      pdfdata.p_id = existPatient[0].uuid;
      pdfdata.p_name =
        existPatient[0].first_name +
        " " +
        (existPatient[0].middle_name ? existPatient[0].middle_name + " " : "") +
        (existPatient[0].last_name || "");
      pdfdata.p_age = existPatient[0].age;
      pdfdata.p_gender = existPatient[0].gender;
      pdfdata.p_address = existPatient[0].address1;
      pdfdata.p_phone = existPatient[0].phone;
      pdfdata.p_email = existPatient[0].email;
      pdfdata.height = existPatient[0].height || "";
      pdfdata.weight = existPatient[0].weight || "";
      pdfdata.p_dob = moment(existPatient[0].date_of_birth).format("ll");
      pdfdata.date = moment().tz("Asia/Kolkata").format("MMM D, YYYY hh:mm a");
      if (
        existPatient[0].app_language &&
        existPatient[0].app_language == "es"
      ) {
        emaillang = "es";
        emailtitle = "Aquí está tu receta digital de Dr. LaBike";
      }
    } else {
      return res
        .status(200)
        .json({ status_code: 404, status_message: "Patient doesn't exist" });
    }
    let agent_email = null;
    var existVitals = await db.execQuery(
      "SELECT vitals.*, user_call_logs.agent_id, user_call_logs.allergies,user_call_logs.symptoms,user_call_logs.medications FROM vitals LEFT JOIN user_call_logs on vitals.call_id = user_call_logs.id where call_id = '" +
        req.body.call_id +
        "' "
    );

    console.log(existVitals, "check existVitals id ");
    if (existVitals.length === 0) {
      existVitals = [{}];
    }
    if (existVitals[0].agent_id) {
      let existAgent = await db.execQuery(
        "SELECT users.uuid,users.email, users.first_name, users.last_name, users.address1, users.phone, users.users_id FROM users WHERE users_id = '" +
          existVitals[0].agent_id +
          "'"
      );

      if (existAgent.length > 0) {
        agent_email = existAgent[0].email;
        pdfdata.agent_name =
          existAgent[0].first_name + " " + (existAgent[0].last_name || "");
        pdfdata.agent_address = existAgent[0].address1;
        pdfdata.agent_phone = existAgent[0].phone;
        pdfdata.agent_id = existAgent[0].uuid;
      }
    }

    if (!req.body.is_url) {
      pdfdata.spo2 = existVitals[0].oxygen_blood_saturation || "";
      pdfdata.bp = existVitals[0].bp || "";
      pdfdata.pulse = existVitals[0].heart_rate || "";
      pdfdata.temp = existVitals[0].heart_rate_variation || "";
      pdfdata.imc = existVitals[0].accelerometer || "";
      pdfdata.medications = existVitals[0].medications
        ? JSON.parse(existVitals[0].medications)
        : [];
      pdfdata.allergies = existVitals[0].allergies
        ? JSON.parse(existVitals[0].allergies)
        : [];
      pdfdata.symptoms = existVitals[0].symptoms || "";

      // console.log(req.body.medicine);
      var params = {
        call_id: req.body.call_id,
        diagnostic: req.body.diagnostic,
        medicine: req.body.medicine ? req.body.medicine : "[]",
        treatment: req.body.conditions_previous
          ? req.body.conditions_previous
          : "",
        indications_and_notes: req.body.indications_and_notes,
        // height: req.body.height,
        // weight: req.body.weight
      };
    } else {
      pdfdata.url = req.body.url;
      var params = {
        call_id: req.body.call_id,
        url: req.body.url,
      };
    }

    // console.log(params)
    var prescription = await db.inputQuery(
      "INSERT INTO prescription SET ?",
      params
    );
    if (req.body.medicine) {
      pdfdata.medicine = JSON.parse(req.body.medicine);
    }
    pdfdata.pdfUrl =
      "uploads/pdf/" +
      pdfdata.p_name +
      "-" +
      "Prescription" +
      "-" +
      req.body.call_id +
      ".pdf";
    // pdfdata.pdfUrl = "thisName.pdf";
    await generatePdf(pdfdata);

    // var fpdf;
    // var fpdf = fs.readFile("./output.pdf", "utf8");

    var docparams = {
      patient_id: existPatient[0].users_id,
      url: pdfdata.pdfUrl,
      type: "pdf",
      is_active: 1,
      call_id: req.body.call_id,
      upload_by: existDocotr[0].users_id,
    };
    var createDocument = await db.inputQuery(
      "INSERT INTO documents SET ?",
      docparams
    );
    var attachment = fs.readFileSync(pdfdata.pdfUrl).toString("base64");

    async function sendEmailFn(email, cb) {
      var msg = {
        from: "Dr. LaBike <" + config.sendgrid.sendgridemail + ">",
        to: email,
        subject: emailtitle,
        html: cb(pdfdata, emaillang),
        attachments: [
          {
            content: attachment,
            filename: "prescription.pdf",
            type: "application/pdf",
            disposition: "attachment",
          },
        ],
      };
      return sgMail.send(msg);
    }

    let sendEmail = await sendEmailFn(
      req.body.email,
      common.prescriptionTemplate
    );
    console.log("Coming here4 mail");
    console.log("[camp.js || Line no. 1496 ....]", "Agent email", agent_email);
    console.log("[camp.js || Line no. 1497 ....]", sendEmail);
    if (agent_email) {
      console.log("Coming here4 mail condition");
      sendEmail = await sendEmailFn(
        agent_email,
        common.agentPrescriptionTemplate
      );
      console.log(
        "[camp.js || Line no. 1500 ....]",
        "Sending to agent",
        sendEmail
      );
    } else {
      console.log("no mail found");
    }
    console.log("Coming here4 mail 76");
    console.log(sendEmail, "sendEmail 78");

    console.log("Coming here4 mail 98765678987");
    return res.status(200).json({
      status_code: 200,
      status_message: "Create prescription pdf successfully.",
    });

    if (sendEmail[0].statusCode == 202) {
      console.log("Coming here4 mail 987657897");
      return res.status(200).json({
        status_code: 200,
        status_message: "Create prescription pdf successfully.",
        // "result": fpdf
      });
    } else {
      console.log("Coming here4 mail 98765");
      return res.status(200).json({
        status_code: 200,
        status_message: "Something went wrong in sending email.",
      });
    }
  } catch (err) {
    console.log("Coming here4 mail err");
    // in case of error or exception
    // logger.error(pathName, 'create camp -Error :-', err, ':', __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error", err });
  }
};

/**
 * @swagger
 * /camp/downloadPdf:
 *   post:
 *     tags:
 *       - camp
 *     description: download  pdf
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: step1
 *         description:
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             doctor_id:
 *               type: string
 *             patient_id:
 *               type: string
 *             call_id:
 *               type: string
 *     responses:
 *       200:
 *         description: download pdf Successfully
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */

// Read HTML Template

camp.downloadPdf = async function (req, res) {
  console.log(req.body);

  try {
    if (!req.body.call_id || req.body.call_id == 0) {
      logger.error(
        pathName,
        "Create pdf mandatory field call id is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Required call id field." });
    }
    if (!req.body.doctor_id || req.body.doctor_id == 0) {
      logger.error(
        pathName,
        "Create pdf mandatory field doctor id is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Doctor is missing." });
    }
    if (!req.body.patient_id) {
      logger.error(
        pathName,
        "Create pdf mandatory field patient id is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Patient is missing." });
    }

    // Fetch the document url in the format
    const query = `
     SELECT * FROM documents WHERE upload_by = ${req.body.doctor_id} AND patient_id = ${req.body.patient_id} AND call_id = ${req.body.call_id} ORDER BY id DESC
    `;
    const existDocument = await db.execQuery(query);
    if (existDocument.length === 0) {
      return res
        .status(200)
        .json({ status_code: 404, status_message: "Document not found." });
    }
    // return res.sendFile(__dirname + 'uploads/images/1633524555909IMG-20210910-WA0002.jpg');
    // await new Promise((resolve, reject) => {
    res.status(200).json({
      status_code: 200,
      status_message: "File fetched successfully.",
      result: existDocument[0].url,
    });
  } catch (err) {
    // in case of error or exception
    // logger.error(pathName, 'create camp -Error :-', err, ':', __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /getPayment/information/:camp_id:
 *   get:
 *     tags:
 *       - camp
 *     description: get payment information on camp
 *     produces:
 *       - application/x-www-form-urlencoded
 *     responses:
 *       200:
 *         description: get payment information on camp
 *       404:
 *         description: camp not found
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.getPaymentDetails = async function (req, res) {
  logger.info(pathName, "Get payment information", req.params.camp_id);
  try {
    var query =
      "SELECT paypal_secret_key,amount,enable_payment FROM camp_lists where camp_id = '" +
      req.params.camp_id +
      "'";
    var payment = await db.execQuery(query);
    if (payment.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Payment Details",
        result: payment[0],
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "Camp information is required",
      });
    }
  } catch (err) {
    logger.error(pathName, "Get user List -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /rating/add:
 *   post:
 *     tags:
 *       - camp
 *     description: create rating
 *     produces:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - in: body
 *         name: body
 *         description: create rating
 *         schema:
 *           type: object
 *           properties:
 *             rating:
 *               type: string
 *             provider_id:
 *               type: string
 *             patient_id:
 *               type: string
 *             call_id:
 *               type: string
 *     responses:
 *       201:
 *         description: rating add successfully
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.addRating = async function (req, res) {
  logger.info(pathName, "Create rating ");
  try {
    if (!req.body.rating || req.body.rating == "") {
      logger.error(
        pathName,
        "Create rating mandatory field rating is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Rating is required." });
    }
    if (!req.body.call_id || req.body.call_id == "") {
      logger.error(
        pathName,
        "Create rating mandatory field call_id is required :",
        __line
      );
      return res
        .status(200)
        .json({ status_code: 400, status_message: "Call id is required." });
    }
    if (
      !req.body.provider_id ||
      req.body.provider_id == "" ||
      !req.body.patient_id ||
      req.body.patient_id == ""
    ) {
      logger.error(
        pathName,
        "Create rating mandatory field patient/provider  is required :",
        __line
      );
      return res.status(200).json({
        status_code: 400,
        status_message: "Patient/Provider is required.",
      });
    }
    var params = {
      rating: req.body.rating,
      provider_id: req.body.provider_id, // doctor_id
      patient_id: req.body.patient_id,
      call_id: req.body.call_id,
      review: req.body.review,
    };
    var addrating = await db.inputQuery("INSERT INTO ratings SET ?", params);
    if (addrating) {
      return res.status(200).json({
        status_code: 201,
        status_message: "Rating submitted successfully.",
        result: addrating,
      });
    } else {
      return res
        .status(200)
        .json({ status_code: 500, status_message: "Internal Server Error" });
    }
  } catch (err) {
    logger.error(pathName, "add rating  -Error :-", err, ":", __line);
    return res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};
/**
 * @swagger
 * /agent/appointment/upcoming/:agent_id/:page/:limit:
 *   get:
 *     tags:
 *       - camp
 *     description: Return all upcoming appointment by agent id
 *
 *     parameters:
 *       - name: id
 *         description: agent id
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
camp.upcomingAppointments = async function (req, res) {
  logger.info(pathName, "Upcoming Appointments agent id ", req.params.agent_id);
  if (!req.params.agent_id || req.params.agent_id == "") {
    logger.error(
      pathName,
      "Upcoming Appointments mandatory field patient id is required:",
      __line
    );
    return res.status(200).json({
      status_code: 400,
      status_message: "Agent id is missing for get upcoming appointment.",
    });
  }

  try {
    var limit = req.params.limit || 20;
    var offset = req.params.page > 0 ? req.params.page - 1 : 0;

    const now = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss");

    // Copied from deshclinic
    var appointmentDetails = await db.execQuery(
      "SELECT user_call_logs.id as call_id, user_call_logs.doctor_id as call_doc_id,vitals.id as vital_id, vitals.doctor_id as vital_doc_id, vitals.*, appointments.id as appointment_id,appointments.*,users.symptoms as u_symp, users.allergies as u_aller,users.*,u.first_name as p_first_name,u.last_name as p_last_name,u.email as p_email,u.phone as p_phone,u.address1 as p_address1, user_call_logs.symptoms as symptoms,user_call_logs.allergies as allergies, user_call_logs.* FROM appointments LEFT JOIN users ON appointments.doctor_id = users.users_id LEFT JOIN users as u ON appointments.patient_id = u.users_id LEFT JOIN vitals ON appointments.call_id = vitals.call_id LEFT JOIN user_call_logs ON appointments.call_id = user_call_logs.id where DATE_ADD(appointments.date, INTERVAL '05:00' HOUR_SECOND) > '" +
        now +
        "' AND user_call_logs.video_connect !=1 AND appointments.agent_id ='" +
        req.params.agent_id +
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
      "Upcoming Appointments by Patient -Error :-",
      err,
      ":",
      __line
    );
    console.log(err);
    return res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /agent/appointment/past/:agent_id/:page/:limit:
 *   get:
 *     tags:
 *       - patient
 *     description: Return all past appointment by agent id
 *
 *     parameters:
 *       - name: id
 *         description: agent id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: All past appointments list  by a agent
 *       404:
 *         description: Appointments list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
camp.pastAppointments = async function (req, res) {
  logger.info(pathName, "Past Appointments agent id", req.params.agent_id);
  if (!req.params.agent_id || req.params.agent_id == "") {
    logger.error(
      pathName,
      "Past Appointments mandatory field id is required:",
      __line
    );
    return res.status(200).json({
      status_code: 400,
      status_message: "Agent id is missing for get past appointment.",
    });
  }
  try {
    var limit = req.params.limit;
    var offset = req.params.page > 0 ? req.params.page - 1 : 0;
    var appointmentDetails = await db.execQuery(
      "SELECT user_call_logs.id as call_id,user_call_logs.*,p.first_name as p_first_name,p.last_name as p_last_name, p.email as p_email, p.phone as p_phone, p.address1 as p_address1,users.title,users.first_name,users.last_name,users.gender,users.image,users.email,users.phone,users.education_details,appointments.status,vitals.oxygen_blood_saturation,vitals.heart_rate,vitals.heart_rate_variation,vitals.accelerometer FROM user_call_logs LEFT JOIN users ON user_call_logs.doctor_id = users.users_id LEFT JOIN users as p ON user_call_logs.patient_id = p.users_id LEFT JOIN vitals ON user_call_logs.id = vitals.call_id LEFT JOIN appointments ON user_call_logs.id = appointments.call_id where (user_call_logs.video_connect =1 ) AND user_call_logs.agent_id =" +
        req.params.agent_id +
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
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /admin/city/:state:
 *   get:
 *     tags:
 *       - camp
 *     description: Return all city list
 *     responses:
 *       200:
 *         description: All city List
 *       404:
 *         description: City list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
camp.allCityList = async function (req, res) {
  logger.info(pathName, "All city list");
  try {
    var allCity = await db.execQuery(
      "select * from cities where state_id = (select id from states where name ='" +
        req.params.state_id +
        "')"
    );
    if (allCity.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "All City List",
        result: allCity,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "No City found" });
    }
  } catch (err) {
    logger.error(pathName, "city -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /admin/state:
 *   get:
 *     tags:
 *       - camp
 *     description: Return all state list
 *     responses:
 *       200:
 *         description: All state List
 *       404:
 *         description: state list doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 *
 */
camp.allStateList = async function (req, res) {
  logger.info(pathName, "All state list");
  try {
    var allState = await db.execQuery(
      "SELECT * from states where country_id= '105'"
    );
    if (allState.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "All state List",
        result: allState,
      });
    } else {
      res
        .status(200)
        .json({ status_code: 404, status_message: "No state found" });
    }
  } catch (err) {
    logger.error(pathName, "state -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};

/**
 * @swagger
 * /drugs/Search/:page/:limit/:name:
 *   get:
 *     tags:
 *       - camp
 *     description: search a drugs by it's name
 *     responses:
 *       200:
 *         description: get a drugs list successfully
 *       404:
 *         description: Drugs doesn't exist
 *     security:
 *     - petstore_auth:
 *       - "write:pets"
 *       - "read:pets"
 */
camp.drugsSearch = async function (req, res) {
  var limit = req.params.limit;
  var offset = req.params.page > 0 ? req.params.page - 1 : 0;
  logger.info(pathName, "drugs search");
  try {
    req.params.name = req.params.name || "";
    var sql =
      "SELECT * FROM drugs WHERE  (medicine LIKE '%" +
      req.params.name +
      "%') ORDER BY id DESC limit " +
      limit +
      " offset " +
      limit * offset;
    var existDrugs = await db.execQuery(sql);
    if (existDrugs.length > 0) {
      res.status(200).json({
        status_code: 200,
        status_message: "Drugs Search Results",
        result: existDrugs,
      });
    } else {
      res.status(200).json({
        status_code: 404,
        status_message: "There  are no Drugs available",
      });
    }
  } catch (err) {
    logger.error(pathName, "Drugs search -Error :-", err, ":", __line);
    res
      .status(200)
      .json({ status_code: 500, status_message: "Internal Server Error" });
  }
};
module.exports = camp;
