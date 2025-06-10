const express = require('express');
const auth = require("../controllers/verifyAuth");
const user = require("../controllers/user");
const {ROUTES_ENUM} = require("../constants/routes");
const {validate, createRoleValidationRules, updateRoleValidationRules, sendOtpValidationRules, verifyOtpValidationRules,
  checkExistUserValidationRules, patientSignInValidationRules, logOutValidationRules
} = require("../helper/validator");
const {createRoleController, updateRolePermissionController, updateRoleController, sendOtpController,
  verifyOtpController, checkExistUserController, patientSignInController, generateSessionTokenController,
  logOutController
} = require("../controllers/userControllers");
const {body} = require("express-validator");

const router = express.Router();

router.post(
  ROUTES_ENUM.USER.CREATE_ROLE,
  auth,
  // ...getDoctorValidationRules,
  ...createRoleValidationRules(),
  validate,
  createRoleController
);
router.put(
  ROUTES_ENUM.USER.UPDATE_ROLE,
  auth,
  ...updateRoleValidationRules(),
  // ...getDoctorValidationRules,
  validate,
  updateRoleController
);
// router.put(
//   ROUTES_ENUM.USER.UPDATE_ROLE_STATUS,
//   auth,
//   // ...getDoctorValidationRules,
//   validate,
//   user.updateRoleStatus
// );
router.post(
  ROUTES_ENUM.USER.SEND_OTP,
  // auth,
  ...sendOtpValidationRules(),
  validate,
  sendOtpController
);
router.get(
  ROUTES_ENUM.USER.VERIFY_OTP,
  // auth,
  ...verifyOtpValidationRules(),
  validate,
  verifyOtpController
);
router.get(
  ROUTES_ENUM.USER.CHECK_EXIST_USER,
  // auth,
  ...checkExistUserValidationRules(),
  validate,
  checkExistUserController
);
router.post(
  ROUTES_ENUM.USER.PATIENT_SIGN_IN,
  // auth,
  ...patientSignInValidationRules(),
  validate,
  patientSignInController
);
router.get(
  ROUTES_ENUM.USER.GENERATE_SESSION_TOKEN,
  auth,
  // ...getDoctorValidationRules,
  // validate,
  generateSessionTokenController
);
router.get(
  ROUTES_ENUM.USER.LOGOUT,
  // ...getDoctorValidationRules,
  ...logOutValidationRules(),
  validate,
  logOutController
);



// router.post('/user/createRole', auth, user.createRole);
// router.put('/user/updateRolePermission/:id', auth, user.updateRolePermission);
// router.put('/user/updateRoleStatus/:id', auth, user.updateRoleStatus);
// router.post('/admin/login', user.adminLogin);
// router.post('/user/sendOtp', user.sendOtp);
// router.get('/user/verifyOtp/:emailPhone/:otp', user.verifyOtp);
// router.get('/user/checkExistUser/:emailPhone/:type', user.checkExistUser);
// router.post('/user/patientSignIn', user.patientSignIn);
// router.get('/user/generateSessionToken', auth, user.generateSessionToken);
// router.get('/user/logout/:uuid', auth, user.logout);

module.exports = router;
