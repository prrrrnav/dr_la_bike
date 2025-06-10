const { sendResponseInJson } = require("../utils/utils");
const logger = require("../middlewares/logger");
const db = require("../helper/database");
const { handleServerError } = require("../middlewares/middlewares");
const crypto = require("crypto");
const moment = require("moment-timezone");
const {isTrueSet, isDefined} = require("./common");
const {user} = require("../helper/User");
const doctorControllers = {};

// Util function for the date query in MySQL
function queryForDate(columnName, date, excludeAND) {
  const dateInISOString = new Date(date).toISOString();
  let date1 = moment(dateInISOString).format('YYYY-MM-DD');

  let query = '';
  if (!excludeAND) {
    query = ' AND ';
  }
  query += `DATE_FORMAT(${columnName}, "%Y-%m-%d") = '${date1}'`
  return query;
}

// TODO: Improve the count query cause right now its querying every time even while the param about search is unchanged and just page and limit is changing

// TODO: Temporary Function
// In future, it will be removed
async function getRecordCount(table, primary_key, as, cond, search, addedQuery) {
  const query = `SELECT COUNT(${primary_key}) as ${as} FROM ${table} where ${cond}
    AND ( 
      CONCAT( users.first_name, ' ', users.middle_name, ' ', users.last_name ) LIKE '%${search || ''}%'
      OR  users.email LIKE '%${search || ''}%'
      OR  users.phone LIKE '%${search || ''}%'
      OR  users.aadhaar_number LIKE '%${search || ''}%'
    ) ` + addedQuery;
  return db.execQuery(query);
}

// OR  users.last_name LIKE '%${search || ''}%'
// OR  users.middle_name LIKE '%${search || ''}%'

/**
 * @swagger
 * /api/search-camp/{page}/{limit}{?search}{?city}{?state}{?enable_payment}:
 *   get:
 *     tags:
 *       - camp
 *     description: search camps
 *     parameters:
 *       - in: query
 *         name: search
 *         type: string
 *         description: Search string for the query
 *       - in: query
 *         name: state
 *         type: string
 *         description: State doctor belongs to
 *         enum: ['DELHI', 'ASSAM', 'MAHARASHTRA', 'MORE STATES']
 *       - in: query
 *         name: city
 *         type: string
 *         description: City doctor lives in
 *         enum: ['North East Delhi', 'South Delhi', 'Pune', 'MORE CITIES']
 *       - in: query
 *         name: enable_payment
 *         type: string
 *         enum: ['yes', 'no']
 *         description: Payment is enable or not
 *     responses:
 *       200:
 *         description: get a doctor list successfully {users, userCount}
 *       404:
 *         description: doctor doesn't exist
 *     security:
 */
exports.searchCamp = async function searchCamp(req, res, next) {
  try {
    const limit = req.params.limit;
    const offset = req.params.page;
    // const offset = req.params.page > 0 ? req.params.page - 1 : 0;
    const { search, city, state, enable_payment, is_active } = req.query;
    // const module_id = res.locals.module_assign_id;

    // Master query
    let query = `
    SELECT * FROM camp_lists `;

    /**
     * @param {*} obj
     * @description Adding the filters provided in the query by the consumer of the api
     * We are getting the query of {search, city, state, experience, is_active}
     * So with the "prepareQuery" function we are iterating through all the keys provided in the object
     * and concatenating to the query string if the key is not undefined and not null
     */
    function prepareQuery(obj) {
      let queryToBeAdded = `
        WHERE is_active = ${is_active !== 1 || is_active !== 0 ? 1 : is_active} 
        AND ( 
          camp_name LIKE '%${search || ''}%'
          OR  address LIKE '%${search || ''}%'
          OR  id LIKE '%${search || ''}%'
          OR  tele_phone LIKE '%${search || ''}%'
        ) 
      `;

      // Iterating through the keys of provided obj
      Object.keys(obj).forEach((key) => {
        // Checking if the key is associated to the provided object and
        // the provided key is not null and undefined
        if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null) {
          // then inserting the query to the main query
          queryToBeAdded += `AND ${key} = '${obj[key]}' `;
        }
      });
      return queryToBeAdded;
    }

    // throw Error('Nice one');

    // Preparing the query on behalf of the provided filters from the consumer
    const obj = { state, city, enable_payment, is_active };
    query += prepareQuery(obj);


    // TODO: Refactor this code for performance as it is fetching on every search where parameter is not changed just offset changed
    let countQuery = 'SELECT COUNT(*) as campCount FROM camp_lists ';
    countQuery += prepareQuery(obj);
    const campCount = await db.execQuery(countQuery);

    // Inserting the query for the pagination
    query += `ORDER BY id DESC limit ${limit} offset ${offset}`;
    // query += `ORDER BY users_id DESC limit ${limit} offset ${limit * offset}`;

    // Finally querying the database
    const camps = await db.execQuery(query);

    // Handling the results from database
    if (camps.length <= 0) {
      return sendResponseInJson(res, 404, 'There are no camps available');
    }
    return sendResponseInJson(res, 200, 'Camps fetched successfully!', { data: camps, count: campCount[0].campCount });

  } catch (e) {
    // Sending the details to the express error middleware
    // Function name, File name, Line number to the logger
    // res.locals.err_obj = {
    //   fnName: arguments.callee.name,
    //   fileName: __fileName,
    //   line: __line
    // };
    // return handleServerError(res, e);
    return next(e);
  }
}

/**
 * @swagger
 * /api/search-user/{page}/{limit}{?role}{?search}{?city}{?state}{?experience}{?is_active}:
 *   get:
 *     tags:
 *       - doctor
 *     description: search a User by its role and some parameters
 *     parameters:
 *       - in: query
 *         name: role
 *         type: string
 *         description: Role of the user to fetch
 *       - in: query
 *         name: search
 *         type: string
 *         description: Search string for the query
 *       - in: query
 *         name: camp_id
 *         type: string
 *         description: Camp id
 *       - in: query
 *         name: state
 *         type: string
 *         description: State doctor belongs to
 *         enum: ['DELHI', 'ASSAM', 'MAHARASHTRA', 'MORE STATES']
 *       - in: query
 *         name: city
 *         type: string
 *         description: City doctor lives in
 *         enum: ['North East Delhi', 'South Delhi', 'Pune', 'MORE CITIES']
 *       - in: query
 *         name: experience
 *         type: string
 *         enum: ['Less than 3 years', 'Around 3 to 5 years', 'Beyond 5 years', and could be any range]
 *         description: Doctor overall experience,  [4-5], [5-*]
 *       - in: query
 *         name: is_active
 *         type: string
 *         enum: ['Active', 'Inactive']
 *         description: Is doctor status active or inactive
 *     responses:
 *       200:
 *         description: get a doctor list successfully {users, userCount}
 *       404:
 *         description: doctor doesn't exist
 *     security:
 */
exports.searchUser = async function searchDoctor(req, res, next) {
  try {
    const limit = req.params.limit;
    const offset = req.params.page;
    // const offset = req.params.page > 0 ? req.params.page - 1 : 0;
    
    if(req.query.camp_id==0){
        req.query.camp_id = '';
    }
    const { search, city, state, experience, is_active, camp_id } = req.query;
    const module_id = res.locals.module_assign_id;
    let specwher = '';
    if(module_id == 3){
        specwher = ' FIND_IN_SET(specialities.id, users.speciality) AND '
    }
    
    // Master query
    let query = `
    SELECT
      users.*,
      GROUP_CONCAT(specialities.name) as s_name,
      ${module_id == 5 || module_id == 4 ? '(SELECT camp_lists.camp_name FROM camp_lists WHERE camp_lists.camp_id = users.camp_id) as camp_name,' : ''}
      (SELECT AVG(ratings.rating) from ratings
      WHERE provider_id = users.users_id) as avgrating
      FROM users,specialities
      WHERE ${specwher} user_type_id = ${module_id} 
      AND ( 
      CONCAT( users.first_name, ' ', users.middle_name, ' ', users.last_name ) LIKE '%${search || ''}%'
      OR CONCAT( users.first_name, ' ', users.last_name ) LIKE '%${search || ''}%'
        OR  users.email LIKE '%${search || ''}%'
        OR  users.phone LIKE '%${search || ''}%'
        OR  users.aadhaar_number LIKE '%${search || ''}%'
      ) `;
    // OR  users.last_name LIKE '%${search || ''}%'
    // OR  users.middle_name LIKE '%${search || ''}%'
console.log(query)
    /**
     * @param {*} obj
     * @description Adding the filters provided in the query by the consumer of the api
     * We are getting the query of {search, city, state, experience, is_active}
     * So with the "prepareQuery" function we are iterating through all the keys provided in the object
     * and concatenating to the query string if the key is not undefined and not null
     */
    function prepareQuery(obj) {
      let queryToBeAdded = '';
      // Iterating through the keys of provided obj
      Object.keys(obj).forEach((key) => {
        // Checking if the key is associated to the provided object and
        // the provided key is not null and undefined
        if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null) {
          // then inserting the query to the main query
          queryToBeAdded += `AND users.${key} = '${obj[key]}' `;
        }
      });
      return queryToBeAdded;
    }

    // throw Error('Nice one');

    // Preparing the query on behalf of the provided filters from the consumer
    query += prepareQuery({ state, city, experience, is_active, camp_id });

console.log(query);
    // TODO: Refactor this code for performance as it is fetching on every search where parameter is not changed just offset changed
    const userCount = await getRecordCount('users', 'users_id', 'userCount', 'user_type_id = ' + module_id, search, prepareQuery({ state, city, experience, is_active, camp_id }));

    // Inserting the query for the pagination
    query += ` GROUP BY users.users_id ORDER BY users_id DESC limit ${limit} offset ${offset}`;
    // query += `ORDER BY users_id DESC limit ${limit} offset ${limit * offset}`;

    // Finally querying the database
    const users = await db.execQuery(query);

    // Handling the results from database
    if (users.length <= 0) {
      return sendResponseInJson(res, 404, 'There are no users available');
    }
    return sendResponseInJson(res, 200, 'Users fetched successfully!', { data: users, count: userCount[0].userCount });

  } catch (e) {
    // Sending the details to the express error middleware
    // Function name, File name, Line number to the logger
    // res.locals.err_obj = {
    //   fnName: arguments.callee.name,
    //   fileName: __fileName,
    //   line: __line
    // };
    // return handleServerError(res, e);
    console.log(e);
    return next(e);
  }
}

/**
 * @swagger
 * /api/search-appointment/{page}/{limit}{?search}{?date}{?consultation_type}:
 *   get:
 *     tags:
 *       - appointment
 *     description: search appointments
 *     parameters:
 *       - in: query
 *         name: search
 *         type: string
 *         description: Search string for the query
 *       - in: query
 *         name: date
 *         type: string
 *         description: Date of the appointment must be in ISO Format
 *         enum: ['DELHI', 'ASSAM', 'MAHARASHTRA', 'MORE STATES']
 *       - in: query
 *         name: consultation_type
 *         type: string
 *         description: Consultation Type
 *         enum: ['Consultation types...']
 *     responses:
 *       200:
 *         description: get a appointment list successfully
 *       404:
 *         description: appointments doesn't exist
 *     security:
 */
exports.searchAppointment = async function searchAppointment(req, res, next) {
  try {
    const limit = req.params.limit;
    const offset = req.params.page;
    // const offset = req.params.page > 0 ? req.params.page - 1 : 0;
    const { search, date, consultation_type } = req.query;
    // const module_id = res.locals.module_assign_id;

    // Master query
    let query = `
    SELECT appointments.*, appointments.id as appoint_id, p.first_name as p_name, p.middle_name as p_m_name, p.last_name as p_l_name,
        d.first_name as d_name, d.middle_name as d_m_name, d.last_name as d_l_name 
    `;

    let conQuery = `
      FROM appointments
      LEFT JOIN users as p
      ON appointments.patient_id = p.users_id
      LEFT JOIN users as d
      ON appointments.doctor_id = d.users_id 
      WHERE ( 
        CONCAT( p.first_name, ' ', p.middle_name, ' ', p.last_name ) LIKE '%${search || ''}%'
        OR CONCAT( p.first_name, ' ', p.last_name ) LIKE '%${search || ''}%'
        OR CONCAT( d.first_name, ' ', d.last_name ) LIKE '%${search || ''}%'
        OR CONCAT( d.first_name, ' ', d.middle_name, ' ', d.last_name ) LIKE '%${search || ''}%'
        OR  id LIKE '%${search || ''}%'
        OR  agent_id LIKE '%${search || ''}%'
        OR  patient_id LIKE '%${search || ''}%'
        OR  doctor_id LIKE '%${search || ''}%'
      ) 
    `

    if (date) {
      // Using ISO for the moment parameter
      conQuery += queryForDate('appointments.date', date);
    }

    // TODO: Refactor this code for performance as it is fetching on every search where parameter is not changed just offset changed
    let countQuery = 'SELECT COUNT(appointments.id) as appointmentCount ' + conQuery;

    const [{ appointmentCount }] = await db.execQuery(countQuery);

    // Inserting the query for the pagination
    query += conQuery + ` ORDER BY id DESC limit ${limit} offset ${offset}`;
    // query += `ORDER BY users_id DESC limit ${limit} offset ${limit * offset}`;
    const appointments = await db.execQuery(query);

    // Handling the results from database
    if (appointments.length <= 0) {
      return sendResponseInJson(res, 404, 'There are no appointments available');
    }
    return sendResponseInJson(res, 200, 'Appointments fetched successfully!', { data: appointments, count: appointmentCount });

  } catch (e) {
    // Sending the details to the express error middleware
    // Function name, File name, Line number to the logger
    // res.locals.err_obj = {
    //   fnName: arguments.callee.name,
    //   fileName: __fileName,
    //   line: __line
    // };
    // return handleServerError(res, e);
    console.log(e);
    return next(e);
  }
}

/**
 * @swagger
 * /api/search-speciality/{page}/{limit}{?search}:
 *   get:
 *     tags:
 *       - admin
 *     description: search specialities
 *     parameters:
 *       - in: query
 *         name: search
 *         type: string
 *         description: Search string for the query
 *     responses:
 *       200:
 *         description: get specialities list successfully
 *       404:
 *         description: specialities doesn't exist
 *     security:
 */
exports.searchSpeciality = async function searchSpeciality(req, res, next) {
  try {
    const { limit, page: offset } = req.params;
    // const offset = req.params.page > 0 ? req.params.page - 1 : 0;
    const { search } = req.query;
    // const module_id = res.locals.module_assign_id;

    // Master query
    let query = `
      SELECT * 
    `;

    let conQuery = `
      FROM specialities WHERE name LIKE '%${search || ''}%'
    `;

    // TODO: Refactor this code for performance as it is fetching on every search where parameter is not changed just offset changed
    let countQuery = 'SELECT COUNT(*) as specialityCount ' + conQuery;

    const specialityCount = await db.execQuery(countQuery);

    // Inserting the query for the pagination
    query += conQuery + ` ORDER BY id DESC limit ${limit} offset ${offset}`;
    // query += `ORDER BY users_id DESC limit ${limit} offset ${limit * offset}`;
    const specialities = await db.execQuery(query);

    // Handling the results from database
    if (specialities.length <= 0) {
      return sendResponseInJson(res, 404, 'There are no specialities available');
    }
    return sendResponseInJson(res, 200, 'Specialities fetched successfully!', { data: specialities, count: specialityCount[0].specialityCount });

  } catch (e) {
    // Sending the details to the express error middleware
    // Function name, File name, Line number to the logger
    // res.locals.err_obj = {
    //   fnName: arguments.callee.name,
    //   fileName: __fileName,
    //   line: __line
    // };
    // return handleServerError(res, e);
    return next(e);
  }
}

/**
 * @swagger
 * /api/search-calllog/{page}/{limit}{?search}{?date}:
 *   get:
 *     tags:
 *       - appointment
 *     description: search appointments
 *     parameters:
 *       - in: query
 *         name: search
 *         type: string
 *         description: Search string for the query
 *       - in: query
 *         name: date
 *         type: string
 *         description: Date of the appointment must be in ISO Format
 *         enum: ['DELHI', 'ASSAM', 'MAHARASHTRA', 'MORE STATES']
 *     responses:
 *       200:
 *         description: get a appointment list successfully
 *       404:
 *         description: appointments doesn't exist
 *     security:
 */
exports.searchCallLog = async function searchCallLog(req, res, next) {
  try {
    const limit = req.params.limit;
    const offset = req.params.page;
    // const offset = req.params.page > 0 ? req.params.page - 1 : 0;
    const { search, date } = req.query;
    // const module_id = res.locals.module_assign_id;

    // Master query
    let query = `
        SELECT user_call_logs.*, user_call_logs.id as appoint_id, 
          p.first_name as p_name, p.middle_name as p_m_name, p.last_name as p_l_name, p.email as p_email, p.image as p_image,
          d.first_name as d_name, d.middle_name as d_m_name, d.last_name as d_l_name, d.email as d_email, d.image as d_image, d.year_of_experience as d_exp,
          spec.name as spec_name,
          vitals.oxygen_blood_saturation as spo2, vitals.heart_rate as pulse, vitals.accelerometer as step_count, vitals.heart_rate_variation as temp,
          p_doc.url as p_doc_url, doctor_doc.url as rx_url
        `;
  // ,
    // doctor_doc.url as rx_url, p_doc.url as p_doc_url

    // LEFT JOIN documents as p_doc
    // ON p_doc.call_id = user_call_logs.id and p_doc.patient_id = user_call_logs.patient_id and p_doc.upload_by != user_call_logs.doctor_id

    let conQuery = `
            FROM user_call_logs
            LEFT JOIN users as p
            ON user_call_logs.patient_id = p.users_id
            LEFT JOIN users as d
            ON user_call_logs.doctor_id = d.users_id 
            LEFT JOIN users as agent
            ON user_call_logs.agent_id = agent.users_id
            LEFT JOIN specialities as spec
            ON spec.id = d.speciality
            LEFT JOIN vitals
            ON vitals.call_id = user_call_logs.id
            LEFT JOIN documents as p_doc
            ON p_doc.call_id = user_call_logs.id and p_doc.patient_id = user_call_logs.patient_id and p_doc.upload_by != user_call_logs.doctor_id
            LEFT JOIN documents as doctor_doc
            ON doctor_doc.call_id = user_call_logs.id and doctor_doc.upload_by = user_call_logs.doctor_id and doctor_doc.patient_id = user_call_logs.patient_id
            WHERE 
                user_call_logs.video_connect = 1 
                AND ( 
                CONCAT( p.first_name, ' ', p.middle_name, ' ', p.last_name ) LIKE '%${search || ""
      }%'
                OR CONCAT( p.first_name, ' ', p.last_name ) LIKE '%${search || ""
      }%'
                OR CONCAT( d.first_name, ' ', d.last_name ) LIKE '%${search || ""
      }%'
                OR CONCAT( d.first_name, ' ', d.middle_name, ' ', d.last_name ) LIKE '%${search || ""
      }%'
                OR CONCAT( agent.first_name, ' ', agent.last_name ) LIKE '%${search || ""
      }%'
                OR CONCAT( agent.first_name, ' ', agent.middle_name, ' ', agent.last_name ) LIKE '%${search || ""
      }%'
                OR user_call_logs.id LIKE '%${search || ""}%'
                OR user_call_logs.symptoms LIKE '%${search || ""}%'
                OR user_call_logs.agent_id LIKE '%${search || ""}%'
                OR user_call_logs.patient_id LIKE '%${search || ""}%'
                OR user_call_logs.doctor_id LIKE '%${search || ""}%'
            ) 
        `;

    if (date) {
      conQuery += queryForDate('user_call_logs.patient_connected_at', date);
    }

    // TODO: Refactor this code for performance as it is fetching on every search where parameter is not changed just offset changed
    let countQuery =
      "SELECT COUNT(user_call_logs.id) as callLogCount " + conQuery;

    const callLogCount = await db.execQuery(countQuery);

    // Inserting the query for the pagination
    query += conQuery + ` ORDER BY id DESC limit ${limit} offset ${offset}`;
    // query += `ORDER BY users_id DESC limit ${limit} offset ${limit * offset}`;
    const callLogs = await db.execQuery(query);

    // Handling the results from database
    if (callLogs.length <= 0) {
      return sendResponseInJson(res, 404, "There are no callLogs available");
    }
    return sendResponseInJson(res, 200, "CallLogs fetched successfully!", {
      data: callLogs,
      count: callLogCount[0].callLogCount,
    });
  } catch (e) {
    // Sending the details to the express error middleware
    // Function name, File name, Line number to the logger
    // res.locals.err_obj = {
    //   fnName: arguments.callee.name,
    //   fileName: __fileName,
    //   line: __line
    // };
    // return handleServerError(res, e);
    // logger.error('searchAppointment', ':', __filename + ':' + __line + ' - ', err);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
};

/**
 * @swagger
 * /api/search-payments/{page}/{limit}{?search}{?date}:
 *   get:
 *     tags:
 *       - payment
 *     description: search payments
 *     parameters:
 *       - in: query
 *         name: search
 *         type: string
 *         description: Search string for the query
 *       - in: query
 *         name: date
 *         type: string
 *         description: Date of the appointment must be in ISO Format
 *         enum: ['DELHI', 'ASSAM', 'MAHARASHTRA', 'MORE STATES']
 *     responses:
 *       200:
 *         description: get a payments list successfully
 *       404:
 *         description: payments doesn't exist
 *     security:
 */
exports.searchPayments = async function searchPayments(req, res, next) {
  try {
    const limit = req.params.limit;
    const offset = req.params.page;
    // const offset = req.params.page > 0 ? req.params.page - 1 : 0;
    const { search, date } = req.query;
    // const module_id = res.locals.module_assign_id;

    // Master query
    let query = `
            SELECT payments.*,
            p.first_name as p_name, p.middle_name as p_m_name, p.last_name as p_l_name,
            d.first_name as d_name, d.middle_name as d_m_name, d.last_name as d_l_name,
            c.first_name as c_name, c.middle_name as c_m_name, c.last_name as c_l_name
        `;

    let conQuery = `
            FROM payments
            LEFT JOIN users as p
            ON payments.patient_id = p.users_id
            LEFT JOIN users as d
            ON payments.doctor_id = d.users_id
            LEFT JOIN users as c
            ON payments.agent_id = c.users_id
            WHERE (
                CONCAT( p.first_name, ' ', p.middle_name, ' ', p.last_name ) LIKE '%${search || ""
    }%'
                OR CONCAT( p.first_name, ' ', p.last_name ) LIKE '%${search || ""
    }%'
                OR CONCAT( d.first_name, ' ', d.last_name ) LIKE '%${search || ""
    }%'
                OR CONCAT( d.first_name, ' ', d.middle_name, ' ', d.last_name ) LIKE '%${search || ""
    }%'
                OR CONCAT( c.first_name, ' ', c.last_name ) LIKE '%${search || ""
    }%'
                OR CONCAT( c.first_name, ' ', c.middle_name, ' ', c.last_name ) LIKE '%${search || ""
    }%'
            )
        `;

    if (date) {
      conQuery += queryForDate('payments.created_at', date);
    }

    // TODO: Refactor this code for performance as it is fetching on every search where parameter is not changed just offset changed
    let countQuery =
      "SELECT COUNT(payments.id) as paymentsCount " + conQuery;

    const paymentsCount = await db.execQuery(countQuery);

    // Inserting the query for the pagination
    query += conQuery + ` ORDER BY id DESC limit ${limit} offset ${offset}`;
    // query += `ORDER BY users_id DESC limit ${limit} offset ${limit * offset}`;
    const payments = await db.execQuery(query);

    // Handling the results from database
    if (payments.length <= 0) {
      return sendResponseInJson(res, 404, "There are no payments available");
    }
    return sendResponseInJson(res, 200, "Payments fetched successfully!", {
      data: payments,
      count: paymentsCount[0].paymentsCount,
    });
  } catch (e) {
    // Sending the details to the express error middleware
    // Function name, File name, Line number to the logger
    // res.locals.err_obj = {
    //   fnName: arguments.callee.name,
    //   fileName: __fileName,
    //   line: __line
    // };
    // return handleServerError(res, e);
    // logger.error('searchAppointment', ':', __filename + ':' + __line + ' - ', err);
    console.log(err);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
};

/**
 * @swagger
 * /api/search-ratings/{page}/{limit}{?search}{?date}{?consultation_type}:
 *   get:
 *     tags:
 *       - rating
 *     description: search ratings
 *     parameters:
 *       - in: query
 *         name: search
 *         type: string
 *         description: Search string for the query
 *       - in: query
 *         name: date
 *         type: string
 *         description: Date of the appointment must be in ISO Format
 *       - in: query
 *         name: patient_id
 *         type: string
 *         description: Review for the patient_id
 *       - in: query
 *         name: doctor_id
 *         type: string
 *         description: Review for the doctor_id
 *     responses:
 *       200:
 *         description: get a rating list successfully
 *       404:
 *         description: ratings doesn't exist
 *     security:
 */
exports.searchRatings = async function searchRatings(req, res, next) {
  try {
    const limit = req.params.limit;
    const offset = req.params.page;
    console.log(req.query)
    const { search, date, doctor_id, patient_id } = req.query;
    let query = `
      SELECT ratings.*,
      p.first_name as pf_name, p.middle_name as pm_name, p.last_name as pl_name, p.image as p_image,
      d.first_name as df_name, d.middle_name as dm_name, d.last_name as dl_name, d.image as d_image, 
       GROUP_CONCAT(spec.name) as spec_name
    `;

    let conQuery = `
      FROM ratings
      LEFT JOIN users as p
      ON ratings.patient_id = p.users_id
      LEFT JOIN users as d
      ON ratings.provider_id = d.users_id
      LEFT JOIN specialities as spec
      ON  FIND_IN_SET(spec.id, d.speciality) 
    `;

    if ((search && search.length > 0) || date || doctor_id || patient_id) {
        console.log(search)
        console.log(date)
        console.log(doctor_id)
        console.log(patient_id)
      conQuery += ' WHERE '
    }

    let concatAnd = false;

    if (search && search.length > 0) {
      conQuery += `(
        CONCAT( p.first_name, ' ', p.middle_name, ' ', p.last_name ) LIKE '%${search || ""}%'
        OR CONCAT( p.first_name, ' ', p.last_name ) LIKE '%${search || ""}%'
        OR CONCAT( d.first_name, ' ', d.last_name ) LIKE '%${search || ""}%'
        OR CONCAT( d.first_name, ' ', d.middle_name, ' ', d.last_name ) LIKE '%${search || ""}%'
      ) `;
      concatAnd = true;
    }

    if (date) {
      conQuery += queryForDate('ratings.created_at', date);
    }

    if (doctor_id) {
      if (concatAnd) {
        conQuery += ' AND ';
      }
      conQuery += ` ratings.provider_id = ${doctor_id}`;
    }

    if (patient_id) {
      if (concatAnd) {
        conQuery += ' AND ';
      }
      conQuery += ` ratings.patient_id = ${patient_id} `;
    }

    let countQuery = "SELECT COUNT(ratings.id) as ratingCount " + conQuery;

    const ratingCount = await db.execQuery(countQuery);

    // Inserting the query for the pagination
    query += conQuery + ` GROUP By id ORDER BY id DESC limit ${limit} offset ${offset}`;
    // query += `ORDER BY users_id DESC limit ${limit} offset ${limit * offset}`;
console.log(query)
    const ratings = await db.execQuery(query);

    // Handling the results from database
    if (ratings.length <= 0) {
      return sendResponseInJson(res, 404, "There are no ratings available");
    }
    return sendResponseInJson(res, 200, "Ratings fetched successfully!", {
      data: ratings,
      count: ratingCount[0].ratingCount,
    });
  } catch (e) {
    // Sending the details to the express error middleware
    // Function name, File name, Line number to the logger
    // res.locals.err_obj = {
    //   fnName: arguments.callee.name,
    //   fileName: __fileName,
    //   line: __line
    // };
    // return handleServerError(res, e);
    // logger.error('searchAppointment', ':', __filename + ':' + __line + ' - ', err);
    console.log(e)
    return sendResponseInJson(res, 500, "Internal Server Error");
  }

}

/**
 * @swagger
 * /api/search-call-queue/:page/:limit?search&date&check_in:
 *   get:
 *     tags:
 *       - rating
 *     description: search ratings
 *     parameters:
 *       - in: query
 *         name: search
 *         type: string
 *         description: Search string for the query
 *       - in: query
 *         name: date
 *         type: string
 *         description: Date of the call-queue must be in ISO Format
 *       - in: query
 *         name: check_in
 *         type: string
 *         description: Check in of the call-queue must be in ISO Format
 *     responses:
 *       200:
 *         description: get a call queue successfully
 *       404:
 *         description: call queue doesn't exist
 *     security:
 */
exports.searchCallQueue = async function searchCallQueue(req, res, next) {
  try {
    const limit = req.params.limit;
    const offset = req.params.page;
    const { search, date, check_in } = req.query;
    let query = `
      SELECT waiting_rooms.*,
      p.first_name as pf_name, p.middle_name as pm_name, p.last_name as pl_name, p.phone as p_phone,
      d.first_name as df_name, d.middle_name as dm_name, d.last_name as dl_name
    `;

    let conQuery = `
      FROM waiting_rooms
      LEFT JOIN users as p
      ON waiting_rooms.patient_id = p.users_id
      LEFT JOIN users as d
      ON waiting_rooms.doctor_id = d.users_id
      WHERE (
        CONCAT( p.first_name, ' ', p.middle_name, ' ', p.last_name ) LIKE '%${search || ""}%'
        OR CONCAT( p.first_name, ' ', p.last_name ) LIKE '%${search || ""}%'
        OR CONCAT( d.first_name, ' ', d.last_name ) LIKE '%${search || ""}%'
        OR CONCAT( d.first_name, ' ', d.middle_name, ' ', d.last_name ) LIKE '%${search || ""}%'
        OR p.phone LIKE '%${search || ""}%'
      )
    `;

    if (date) {
      conQuery += queryForDate('waiting_rooms.created_at', date);
    }

    if (check_in) {
      conQuery += queryForDate('waiting_rooms.check_in', date);
    }

    let countQuery = "SELECT COUNT(waiting_rooms.id) as queueCount " + conQuery;

    const [{ queueCount }] = await db.execQuery(countQuery);

    // Inserting the query for the pagination
    query += conQuery + ` ORDER BY id DESC limit ${limit} offset ${offset}`;
    // query += `ORDER BY users_id DESC limit ${limit} offset ${limit * offset}`;

    const callQueue = await db.execQuery(query);

    // Handling the results from database
    if (callQueue.length <= 0) {
      return sendResponseInJson(res, 404, "There are no CallQueue available");
    }
    return sendResponseInJson(res, 200, "CallQueue fetched successfully!", {
      data: callQueue,
      count: queueCount,
    });
  } catch (e) {
    // Sending the details to the express error middleware
    // Function name, File name, Line number to the logger
    // res.locals.err_obj = {
    //   fnName: arguments.callee.name,
    //   fileName: __fileName,
    //   line: __line
    // };
    // return handleServerError(res, e);
    // logger.error('searchAppointment', ':', __filename + ':' + __line + ' - ', err);
    console.log(e);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }

}

/**
 * @swagger
 * /change-password:
 *   post:
 *     tags:
 *       - admin
 *     description: Change Password
 *     parameters:
 *       - in: body
 *         name: oldPassword
 *         type: string
 *         description: Old password
 *       - in: body
 *         name: newPassword
 *         type: string
 *         description: New password
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *       404:
 *         description: User not found with the attached user id
 *     security:
 */
exports.changePassword = async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!req.userDetails.user_id) {
      return sendResponseInJson(res, 401, "Invalid user id");
    }

    const curUser = await db.execQuery("SELECT * FROM users WHERE users_id = " + req.userDetails.user_id + " AND password = '" + crypto.createHash("md5").update(oldPassword).digest("hex") + "'");

    if (curUser.length === 0) {
      return sendResponseInJson(res, 401, "Old Password doesn't match");
    }

    const params = {
      password: crypto.createHash("md5").update(newPassword).digest("hex")
    }

    const passwordUpdated = await db.inputQuery('UPDATE users SET ? WHERE users_id = ' + req.userDetails.user_id, params);
    if (passwordUpdated.length === 0) {
      return sendResponseInJson(res, 401, "Password is not updated, please try again.");
    }
    return sendResponseInJson(res, 200, "Password changed successfully.");
  } catch (e) {
    // Sending the details to the express error middleware
    // Function name, File name, Line number to the logger
    // res.locals.err_obj = {
    //   fnName: arguments.callee.name,
    //   fileName: __fileName,
    //   line: __line
    // };
    // return handleServerError(res, e);
    // logger.error('searchAppointment', ':', __filename + ':' + __line + ' - ', err);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }

}

/**
 * @swagger
 * /api/credits?userId&history:
 *   get:
 *     tags:
 *       - payments
 *     description: Get Credit for the user
 *     parameters:
 *       - in: query
 *         name: userId
 *         type: string
 *         description: User Id
 *       - in: query
 *         name: history
 *         type: string
 *         description: Should include history of the credits in the result
 *         example: true or false
 *     responses:
 *       200:
 *         description: Get Credit by the userId or optionally get history
 *       404:
 *         description: User not found with the attached user id
 *     security:
 */
exports.getCreditByUserId = async function getCreditByUserId(req, res, next) {
  try {
    const { userId, history } = req.query;

    if (!userId) {
      return sendResponseInJson(res, 400, "Invalid user id.");
    }

    const curUser = await db.execQuery("SELECT users.* FROM users WHERE users_id = " + userId);

    if (curUser.length === 0) {
      return sendResponseInJson(res, 404, "User not found.");
    }

    // Handling the creditHistory
    let creditHistory;
    if(isTrueSet(history)) {
      creditHistory = await getCreditHistory({
        updated_for: userId,
        limit: 10,
        offset: 0
      });
    }

    return sendResponseInJson(res, 200, "Credit fetched successfully.", {user: curUser[0], creditHistory});
  } catch (e) {
    // Sending the details to the express error middleware
    // Function name, File name, Line number to the logger
    // res.locals.err_obj = {
    //   fnName: arguments.callee.name,
    //   fileName: __fileName,
    //   line: __line
    // };
    // return handleServerError(res, e);
    // logger.error('searchAppointment', ':', __filename + ':' + __line + ' - ', err);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }

}

/**
 *
 * @param updated_by - User id by which the credit was modified
 * @param updated_for - User id for whom the credit was updated
 * @returns {Promise<unknown>}
 */
async function getCreditHistory({updated_by, updated_for, limit, offset}) {
  if(!isDefined(updated_by) && !isDefined(updated_for)) {
    throw new Error('Updated By or Updated For required.');
  }
  let query = `
    SELECT credits.*, users.first_name, users.middle_name, users.last_name, users.image, users.email, users.credit, users.commission_perc, users.speciality, users.user_type_id, users.camp_id, users.year_of_experience 
  `;

  let conQuery = `
    FROM credits
    LEFT JOIN users
    ON credits.updated_for = users.users_id 
    WHERE
  `;

  if(isDefined(updated_by)) {
    conQuery += `updated_by = ${updated_by}`
  }
  if(isDefined(updated_for)) {
    conQuery += `updated_for = ${updated_for}`
  }

  let countQuery = "SELECT COUNT(credits.id) as creditCount " + conQuery;

  query += conQuery + ` ORDER BY id DESC limit ${limit} offset ${offset}`;

  const data = await db.execQuery(query);

  const [{creditCount}] = await db.execQuery(countQuery);

  return {data, count: creditCount}
}

/**
 * @swagger
 * /api/credits/history/:page/:limit?updated_for:
 *   get:
 *     tags:
 *       - payments
 *     description: Get Credit history for the user
 *     parameters:
 *       - in: query
 *         name: userId
 *         type: string
 *         description: User Id
 *       - in: query
 *         name: history
 *         type: string
 *         description: Should include history of the credits in the result
 *         example: true or false
 *     responses:
 *       200:
 *         description: Get Credit by the userId or optionally get history
 *       404:
 *         description: User not found with the attached user id
 *     security:
 */
exports.fetchCreditHistory = async function fetchCreditHistory(req, res, next) {
  try {
    const { limit, page } = req.params;
    const { updated_for } = req.query;

    // Handling the creditHistory
    let {data, count} = await getCreditHistory({ updated_for, limit, offset: page });

    return sendResponseInJson(res, 200, "Credit history fetched successfully.", {data, count});
  } catch (e) {
    // Sending the details to the express error middleware
    // Function name, File name, Line number to the logger
    // res.locals.err_obj = {
    //   fnName: arguments.callee.name,
    //   fileName: __fileName,
    //   line: __line
    // };
    // return handleServerError(res, e);
    // logger.error('searchAppointment', ':', __filename + ':' + __line + ' - ', err);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }

}


/**
 * @swagger
 * /api/credit:
 *   post:
 *     tags:
 *       - payments
 *     description: Get Credit for the user
 *     parameters:
 *       - in: body
 *         name: updated_for
 *         type: string
 *         description: User Id for which the credit should be updated
 *       - in: body
 *         name: amount
 *         type: number
 *         description: New amount to update
 *       - in: body
 *         name: remarks
 *         type: string
 *         description: Remarks for the credit update
 *     responses:
 *       200:
 *         description: Update the credit for the user
 *       404:
 *         description: User not found
 *     security:
 */
exports.postCreditApi = async function postCreditApi(req, res, next) {
  try {
    const { updated_for, amount, commission_perc, remarks } = req.body;
    const updated_by = req.userDetails.user_id;

    if(+req.userDetails.user_type_id !== 1) {
      return sendResponseInJson(res, 400, "You are not allowed for this action. Please contact administrator.");
    }

    if (!updated_by) {
      return sendResponseInJson(res, 400, "Invalid user id.");
    }

    const response = await postCredit({updated_by, updated_for, amount, commission_perc, remarks});

    if(response.ok) {
      return sendResponseInJson(res, response.status_code || 200, response.message);
    }

    return sendResponseInJson(res, response.status_code || 500, response.message)

    // const curUser = await db.execQuery("SELECT credit FROM users WHERE users_id = " + userId);
    //
    // if (curUser.length === 0) {
    //   return sendResponseInJson(res, 404, "User not found.");
    // }
    //
    // const credit = curUser.credit;
    //
    // // Handling the creditHistory
    // let creditHistory;
    // if(isTrueSet(history)) {
    //   creditHistory = await getCreditHistory({
    //     updated_for: userId
    //   });
    // }

    return sendResponseInJson(res, 200, "Credit fetched successfully.", {credit, creditHistory});
  } catch (e) {
    // Sending the details to the express error middleware
    // Function name, File name, Line number to the logger
    // res.locals.err_obj = {
    //   fnName: arguments.callee.name,
    //   fileName: __fileName,
    //   line: __line
    // };
    // return handleServerError(res, e);
    // logger.error('searchAppointment', ':', __filename + ':' + __line + ' - ', err);
    console.log(e);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }

}

async function postCredit({updated_by, updated_for, amount, commission_perc, remarks, payment_id, addToAmount}) {
  // Here Checking if the params are as they are expected it to be
  let keys = ['updated_by', 'updated_for', 'amount']
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if(!isDefined(arguments[0][key])) {
      return {
        ok: false,
        status_code: 400,
        message: key + ' is required.'
      }
    }
  }

  // Taking snapshot of the old credits
  const userFor = await db.execQuery(`SELECT credit, commission_perc FROM users WHERE users_id = ${updated_for}`);
  if(userFor.length === 0) {
    return {
      ok: false,
      status_code: 404,
      message: 'User not found. Please check user details.'
    }
  }

  const oldCredit = userFor[0].credit;
  const oldPerc = userFor[0].commission_perc;

  // Its redundant if the old and new amount are same
  console.log(+oldCredit, +amount);
 if(!addToAmount && +oldCredit === +amount) {
    if(+commission_perc && +oldPerc !== +commission_perc) {
      console.log(+oldPerc, +commission_perc);
      const updatedUserFor = await db.inputQuery(`UPDATE users SET ? WHERE users_id = ${updated_for}`, {commission_perc});

      // If however we were not able to update any single row
      // It must stop here
      if(updatedUserFor.affectedRows <= 0) {
        return {
          ok: false,
          message: 'We are not able to update the credit. Please try again later.'
        };
      }

      // Returning here as we don't want to do anything else, not tracking in the credit history
      return {
        ok: true,
        status_code: 201,
        message: 'Commission Percentage updated successfully.'
      };
    }
    return {
      ok: false,
      status_code: 400,
      message: 'Its redundant to update the same values.'
    };
  }

  // Updating the credit for the user
//   const updatedUserFor = await db.inputQuery(`UPDATE users SET ? WHERE users_id = ${updated_for}`, {credit: amount, commission_perc});
let paramForUpdatedUserFor = {credit: amount};
  if(addToAmount) {
    paramForUpdatedUserFor.credit = oldCredit + amount;
  }
  if(+commission_perc) {
    paramForUpdatedUserFor.commission_perc = commission_perc;
  }
  const updatedUserFor = await db.inputQuery(`UPDATE users SET ? WHERE users_id = ${updated_for}`, paramForUpdatedUserFor);
  // If however we were not able to update any single row
  // It must stop here
  if(updatedUserFor.affectedRows <= 0) {
    return {
      ok: false,
      message: 'We are not able to update the credit. Please try again later.'
    };
  }

  // After successful update to the user table for credit column
  // Now we are just saving the credit action to history "credits" table
//  const status = amount - oldCredit > 0 ? 'CREDIT' : 'DEBIT';
  let status = amount - oldCredit > 0 ? 'CREDIT' : 'DEBIT';
  if(addToAmount) {
    status = 'CREDIT';
  }
  const params = {
    amount: status === 'CREDIT' ? amount - oldCredit : oldCredit - amount,
    new_amount: amount,
    updated_by,
    updated_for,
    status
  }
   if(addToAmount) {
    params.new_amount = oldCredit + amount;
   params.amount = amount;
  }
  if(remarks) {
    params.remarks = remarks;
  }
  if(payment_id) {
    params.payment_id = payment_id;
  }
  const creditDetails = await db.inputQuery(`INSERT INTO credits SET ?`, params);

  // If all went good(i.e, If we have single affected row) then we are ok to return here
  if(creditDetails.affectedRows > 0) {
    return {
      ok: true,
      message: 'Credit and Commission Percentage updated successfully.'
    };
  }

  // But if somehow interpreter comes here
  // It means something really went wrong, so we are just rolling back the user credit
  const updatedUserForRollBack = await db.inputQuery(`UPDATE users SET ? WHERE users_id = ${updated_for}`, {credit: oldCredit});
  return {
    ok: false,
    message: 'We were unable to update credits for some reason. Credits are rolled back to previous state.'
  };
}
/**
 * @swagger
 * /api/payment:
 *   post:
 *     tags:
 *       - payments
 *     description: Post credits through the payment id
 *     parameters:
 *       - in: body
 *         name: payment_id
 *         type: string
 *         description: Payment ID
 *       - in: body
 *         name: amount
 *         type: number
 *         description: Amount to add to the current credit of the user
 *     responses:
 *       200:
 *         description: Update the credit for the user
 *       404:
 *         description: User not found
 *     security:
 */
exports.postPayment = async function postPayment(req, res, next) {
  try {
    //   console.log('api/payment')
    const {payment_id, amount} = req.body;
    const agent_id = req.userDetails.user_id;
// console.log(payment_id,amount,agent_id)
    const dbResult = await db.execQuery(`SELECT module_assign_id FROM module_assign WHERE role = 'representative'`);
    console.log(req.userDetails);
    // if(+dbResult[0].module_assign_id !== +req.userDetails.user_type_id) {
    //   return sendResponseInJson(res, 500, 'Only agents are allowed for this action.')
    // }
    if(+dbResult[0].module_assign_id !== 5) {
      return sendResponseInJson(res, 500, 'Only agents are allowed for this action.')
    }

    // Add to the payments table
    const params = {
      payment_id,
      amount,
      agent_id,
    }

    const paymentDetails = await db.inputQuery(`INSERT INTO payments SET ?`, params);

    // If all went good(i.e, If we have single affected row) then we are ok to return here
    if(!(paymentDetails.affectedRows > 0)) {
      return sendResponseInJson(res, 500, 'Something went wrong with the payment.')
    }

    // Add to the credit history
    const response = await postCredit({updated_by: agent_id, updated_for: agent_id, amount, payment_id, addToAmount: true});
    console.log(response)
    if (response.ok) {
      return sendResponseInJson(res, response.status_code || 200, 'Payment saved and credit updated successfully.');
    }
    return sendResponseInJson(res, response.status_code || 500, response.message)

  } catch (e) {
    console.log(e);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
}
/**
 * @swagger
 * /api/payment/call:
 *   post:
 *     tags:
 *       - payments
 *     description: Deduct credit on call
 *     parameters:
 *       - in: body
 *         name: agent_id
 *         type: string
 *         description: Agent ID
 *       - in: body
 *         name: call_id
 *         type: number
 *         description: Call ID
 *       - in: body
 *         name: doctor_id
 *         type: number
 *         description: Doctor ID
 *       - in: body
 *         name: patient_id
 *         type: number
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Update the credit for the user
 *       404:
 *         description: User not found
 *     security:
 */
exports.deductCredit = async function deductCredit(req, res, next) {
  try {
    var {agent_id, call_id, doctor_id, patient_id} = req.body;
console.log(req.body)
     if((!agent_id || agent_id =="" || agent_id =="undefined") && (!patient_id || patient_id=="" || patient_id =="undefined")) {
          return sendResponseInJson(res, 404, 'User not found.');
        }
         let agentData;
    if(agent_id && agent_id!=''){
    agentData = await db.execQuery(`SELECT credit, commission_perc FROM users WHERE users_id = ${agent_id} AND user_type_id = 5`);
    if(agentData.length === 0) {
     return sendResponseInJson(res, 404, 'Agent not found.');
    }
    }else{
         agentData = await db.execQuery(`SELECT credit, commission_perc FROM users WHERE users_id = ${patient_id} AND user_type_id = 4`);
         agent_id = patient_id;
         if(agentData.length === 0) {
      return sendResponseInJson(res, 404, 'Patient not found.');
    }
    }
    
        const doctorData = await db.execQuery(`SELECT credit, commission_perc, consultation_fee FROM users WHERE users_id = ${doctor_id} AND user_type_id = 3`);
        if(doctorData.length === 0) {
          return sendResponseInJson(res, 404, 'Doctor not found.');
        }

    const consultation_fee = doctorData[0].consultation_fee;
    const doctorCommissionPer = doctorData[0].commission_perc;
    const doctorOldCredit = doctorData[0].credit;
    const agentCommissionPer = agentData[0].commission_perc;
    const agentOldCredit = agentData[0].credit;

    async function getPerc(amount, perc) {
      return amount * (perc / 100);
    }

    if(agentOldCredit < consultation_fee) {
      return sendResponseInJson(res, 400, "User doesn't have enough credits.");
    }

    const newCreditForDoctor = doctorOldCredit + await getPerc(consultation_fee, (100-doctorCommissionPer));
    const newCreditForAgent = (agentOldCredit - consultation_fee) + await getPerc(consultation_fee, agentCommissionPer);

// console.log(getPerc(consultation_fee, doctorCommissionPer),'  ',getPerc(consultation_fee, agentCommissionPer))
    async function updateCredit(amount, oldCredit, updated_for) {
      const updatedUserFor = await db.inputQuery(`UPDATE users SET ? WHERE users_id = ${updated_for}`, {credit: amount});

      // If however we were not able to update any single row
      // It must stop here
      if(updatedUserFor.affectedRows <= 0) {
        return {
          ok: false,
          message: 'We are not able to update the credit. Please try again later.'
        };
      }

      let status = amount - oldCredit > 0 ? 'CREDIT' : 'DEBIT';
      const params = {
        amount: status === 'CREDIT' ? amount - oldCredit : oldCredit - amount,
        new_amount: amount,
        updated_by: req.userDetails.user_id,
        updated_for,
        status
      }
      const creditDetails = await db.inputQuery(`INSERT INTO credits SET ?`, params);
      // If all went good(i.e, If we have single affected row) then we are ok to return here
      if(creditDetails.affectedRows > 0) {
        return {
          ok: true,
          message: 'Credit updated successfully.'
        };
      }

      // But if somehow interpreter comes here
      // It means something really went wrong, so we are just rolling back the user credit
      return {ok: false};
    }

    const response1 = await updateCredit(newCreditForDoctor, doctorOldCredit, doctor_id);
    const response2 = await updateCredit(newCreditForAgent, agentOldCredit, agent_id);

    if(!response1.ok || !response2.ok) {
      await rollBack();
      return sendResponseInJson(res, 500, "Something went wrong.");
    }

    // const params = {
    //   call_id,
    //   amount: consultation_fee,
    //   doctor_service_amount:await getPerc(consultation_fee, doctorCommissionPer),
    //   clinic_service_amount: await getPerc(consultation_fee, agentCommissionPer),
    //   agent_id,
    //   doctor_id,
    //   patient_id
    // }

    // const paymentDetails = await db.inputQuery(`INSERT INTO payments SET ?`, params);
    // if(!(paymentDetails.affectedRows > 0)) {
    //   await rollBack();
    //   return sendResponseInJson(res, 500, "Something went wrong.");
    // }
    return sendResponseInJson(res, response2.status_code || 200, 'Payment saved and credit updated successfully.');

    async function rollBack() {
      await db.inputQuery(`UPDATE users SET ? WHERE users_id = ${agent_id}`, {credit: agentOldCredit});
      await db.inputQuery(`UPDATE users SET ? WHERE users_id = ${doctor_id}`, {credit: doctorOldCredit});
    }
  } catch (e) {
    console.log(e);
    return sendResponseInJson(res, 500, "Internal Server Error");
  }
}