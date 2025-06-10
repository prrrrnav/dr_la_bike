const { param, body, oneOf, validationResult, check } = require("express-validator");
const { sendResponseInJson } = require("../utils/utils");

const canOnlyBeZero = (field) =>
  param(field)
    .trim()
    .isInt({ lt: 1, gt: -1 })
    .withMessage(field + ' can only be Zero');

const isInteger = (field, default_value) =>
  param(field)
    .trim()
    .default(default_value)
    .isInt()
    .withMessage('Expecting an integer value');

const isPhone = (field) =>
  body(field)
    .trim()
    .isLength({ min: 10, max: 11 })
    .withMessage('Invalid Phone number')
    .matches('[0-9]+')
    .withMessage('Invalid Phone number');


const getDoctorValidationRules = [
  canOnlyBeZero('camp_id'),
  isInteger('page', 1),
  isInteger('limit', 20),
]

function getAgentValidationRules() {
  return [
    isInteger('page', 1),
    isInteger('limit', 20),
  ]
}

const getPatientValidationRules = [
  canOnlyBeZero('camp_id'),
  isInteger('page', 1),
  isInteger('limit', 20),
]

const getAdminValidationRules = [
  canOnlyBeZero('camp_id'),
  isInteger('page', 1),
  isInteger('limit', 20),
]

const getAppointmentsValidationRules = [
  isInteger('page', 1),
  isInteger('limit', 20),
  canOnlyBeZero('camp_id'),
]


const addPatientValidationRules = () => [
  body('email')
    .trim()
    .escape()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid Email'),
  body('height')
    .trim()
    .escape()
    .isInt()
    .withMessage('Height expects numeric values!'),
  body('weight')
    .trim()
    .escape()
    .isInt()
    .withMessage('Weight expects numeric values!'),
  isPhone('phone'),
  // body('phone')
  //   .trim()
  //   .matches('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')
  //   .withMessage('Invalid Phone number'),
  body('address')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Address seems very short'),
  body('city')
    .trim()
    .isLength({ min: 1 })
    .withMessage('City seems very short'),
  body('state')
    .trim()
    .isLength({ min: 1 })
    .withMessage('State seems very short'),
  body('zip_code')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Zip Code seems very short'),
  body('aadhaar_number')
    .trim()
    .isLength({ min: 12, max: 12 })
    .withMessage('Aadhaar Number seems very short!')
    .isInt()
    .withMessage('Aadhaar Number expected numeric values!'),
  body('gender')
    .trim()
    .isIn(['Male', 'Female', 'Others'])
    .isLength({ min: 3 })
    .withMessage('Gender is not valid!'),
  body('first_name')
    .trim()
    .escape()
    .isLength(({ min: 3 }))
    .withMessage('First Name must contain at least 3 characters'),
  body('camp_id')
    .trim()
    .escape()
    .optional({ nullable: true })
    .isInt()
    .withMessage('Expected an integer!'),
  body('date_of_birth')
    .trim()
    .isISO8601()
    .withMessage('Expecting Date in Date of Birth'),
]

const addAdminValidationRules = () => [
  body('email')
    .trim()
    .escape()
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid Email'),
  isPhone('phone'),
  // body('phone')
  //   .trim()
  //   .matches('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')
  //   .withMessage('Invalid Phone number'),
  body('first_name')
    .trim()
    .escape()
    .isLength(({ min: 3 }))
    .withMessage('First Name must contain at least 3 characters'),
  body('camp_id')
    .trim()
    .escape()
    .isInt()
    .withMessage('Expected an integer!'),
  body('role_type')
    .trim()
    .isInt()
    .withMessage('Expecting an integer value'),
  body('password')
    .trim()
    .isLength({ max: 16 })
    .withMessage('Password cannot be greater than 16 characters')
    .isStrongPassword({
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
      minLowercase: 1
    })
    .withMessage('Password length must be in between 8 and 16, 1 Uppercase Letter, 1 Lowercase Letter, 1 Numeric, 1 Symbolic Character.'),
]

const resetPasswordValidationRules = () => [
  body('user_id')
    .trim()
    .isLength({ min: 1 })
    .withMessage('User Id Missing')
    .isInt()
    .withMessage('Expecting an integer value'),
  body('role')
    .trim()
    .isInt()
    .withMessage('Expecting an integer value'),
  body('password')
    .trim()
    .isLength({ max: 16 })
    .withMessage('Password cannot be greater than 16 characters')
    .isStrongPassword({
      minLength: 8,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
      minLowercase: 1
    })
    .withMessage('Password length must be in between 8 and 16, 1 Uppercase Letter, 1 Lowercase Letter, 1 Numeric, 1 Symbolic Character.'),
]

const deleteAppointmentValidationRules = () => [
  param('appointment_id')
    .trim()
    .isInt()
    .withMessage('Expecting an integer value'),
]

const createRoleValidationRules = () => [
  body('role')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Role name is missing'),
  body('status')
    .trim()
    .isIn([1, 0])
    .withMessage('Expecting only 1, 0')
]

const updateRoleValidationRules = () => [
  param('id')
    .trim()
    .isInt()
    .withMessage('Expecting an integer value'),
  oneOf([
    body('module_id')
      .trim()
      .exists()
      .isLength({ min: 1 })
      .withMessage('Module Id is missing'),
    body('status')
      .trim()
      .exists()
      .isIn([1, 0])
      .withMessage('Expecting only 1, 0')
  ], ({ req }) => {
    return 'Expecting at least one of these module_id, status';
  }),
]
const typeEnum = [1, 2, 3];
const languageEnum = ['es', 'en'];
const sendOtpValidationRules = () => [
  body('module')
    .exists()
    .withMessage('Module is missing'),
  body('email')
    .isEmail()
    .optional({ nullable: true })
    .withMessage('Email is invalid'),
  isPhone('phone')
    .optional({ nullable: true }),
  // body('phone')
  //   .trim()
  //   .optional({ nullable: true })
  //   .matches('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')
  //   .withMessage('Invalid Phone number'),
  body('type')
    .isIn(typeEnum)
    .withMessage('type field must contain one of ' + typeEnum)
    .custom((val, { req }) => {
      const types = {
        1: ['email'],
        2: ['phone'],
        3: ['email', 'phone']
      }
      types[val].forEach(field => {
        if (req.body[field] === undefined || req.body[field] === null) {
          throw new Error(field + ' is required for the subsequent type!');
        }
      })
      return true;
    }),
  body('language')
    .optional({ nullable: true })
    .isIn(languageEnum)
    .withMessage('language field must contain one of ' + languageEnum)
]

const verifyOtpValidationRules = () => [
  param('otp')
    .trim()
    .exists()
    .withMessage('OTP code is missing'),
  oneOf([
    param('emailPhone')
      .trim()
      .exists()
      .isEmail()
      .withMessage('Invalid Email'),
    // isPhone('emailPhone'),
    param('emailPhone')
      .trim()
      .exists()
      .matches('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')
      .withMessage('Invalid Phone'),
  ], ({ req }) => {
    return 'Expecting either valid email or phone';
  }),
]

const checkExistUserValidationRules = () => [
  param('type')
    .trim()
    .exists()
    .withMessage('User type is missing'),
  oneOf([
    param('emailPhone')
      .trim()
      .exists()
      .isEmail()
      .withMessage('Invalid Email'),
    // isPhone('emailPhone'),
    param('emailPhone')
      .trim()
      .exists()
      .matches('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')
      .withMessage('Invalid Phone'),
  ], ({ req }) => {
    return 'Expecting either valid email or phone';
  }),
]

const patientSignInValidationRules = () => [
  body('type')
    .trim()
    .exists()
    .withMessage('User type is missing, [role-name]'),
  // body('password')
  //   .trim()
  //   .optional({ nullable: true })
  //   .isLength({ min: 4 })
  //   .withMessage('Password seems very short'),
  oneOf([
    body('login_type')
      .isBoolean()
      .exists()
      .withMessage('Expecting a boolean value'),
    body('loginViaOtp')
      .isBoolean()
      .exists()
      .withMessage('Expecting a boolean value'),
  ], ({ req }) => {
    return 'Expecting either login_type or loginViaOtp';
  }),
  oneOf([
    body('emailPhone')
      .trim()
      .exists()
      .isEmail()
      .withMessage('Invalid Email'),
    isPhone('emailPhone'),
    // body('emailPhone')
    //   .trim()
    //   .exists()
    //   .matches('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')
    //   .withMessage('Invalid Phone'),
  ], ({ req }) => {
    return 'Please enter your e-mail id or mobile number.';
  }),
]

const logOutValidationRules = () => [
  param('uuid')
    .trim()
    .custom((val, { req }) => {
      console.log('[validator.js || Line no. 326 ....]', val);
      if (val === undefined || val === null) {
        throw new Error('uuid is missing');
      }
      return true;
    })
    .isLength({ min: 4 })
    .withMessage('uuid seems very short!'),
]

function validate(req, res, next) {
  const results = validationResult(req);

  if (results.isEmpty()) {
    return next();
  }
  return sendResponseInJson(res, 400, results.array()[0].msg, results.array()[0]);
}

module.exports = {
  canOnlyBeZero,
  isInteger,
  getDoctorValidationRules,
  getAgentValidationRules,
  getPatientValidationRules,
  addPatientValidationRules,
  addAdminValidationRules,
  getAdminValidationRules,
  getAppointmentsValidationRules,
  resetPasswordValidationRules,
  deleteAppointmentValidationRules,
  createRoleValidationRules,
  updateRoleValidationRules,
  sendOtpValidationRules,
  verifyOtpValidationRules,
  checkExistUserValidationRules,
  patientSignInValidationRules,
  logOutValidationRules,
  validate
}
