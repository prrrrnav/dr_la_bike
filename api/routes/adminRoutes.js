const express = require('express');

const { ROUTES_ENUM } = require("../constants/routes");
const auth = require('../controllers/verifyAuth');
const {
  getDoctorListController,
  getAgentListController,
  getPatientListController,
  getAdminListController,
  upcomingAppointmentsController,
  pastAppointmentsController,
  paymentRecordController,
  deleteAppointmentController,
  resetPasswordController,
  getAllEarningReport,
  addPatientController,
  addAdminController, allDashboardCount
} = require("../controllers/adminControllers");
const {
  getDoctorValidationRules,
  getPatientValidationRules,
  getAdminValidationRules,
  getAppointmentsValidationRules,
  getAgentValidationRules,
  addPatientValidationRules,
  addAdminValidationRules,
  resetPasswordValidationRules,
  deleteAppointmentValidationRules,
  validate, allDashboardCountValidationRules
} = require("../helper/validator");
const camp = require("../controllers/camp");

const router = express.Router();

router.get(
  ROUTES_ENUM.ADMIN.GET_DOCTORS,
  auth,
  ...getDoctorValidationRules,
  validate,
  getDoctorListController
);
router.get(
  ROUTES_ENUM.ADMIN.GET_AGENTS,
  auth,
  ...getAgentValidationRules(),
  validate,
  getAgentListController
);

router.get(
  ROUTES_ENUM.ADMIN.GET_PATIENTS,
  auth,
  ...getPatientValidationRules,
  validate,
  getPatientListController
);
router.get(
  ROUTES_ENUM.ADMIN.GET_ADMINS,
  auth,
  ...getAdminValidationRules,
  validate,
  getAdminListController
);
router.post(
  ROUTES_ENUM.ADMIN.ADD_PATIENT,
  auth,
  addPatientValidationRules(),
  validate,
  addPatientController
);
router.post(
  ROUTES_ENUM.ADMIN.ADD_ADMIN,
  auth,
  addAdminValidationRules(),
  validate,
  addAdminController
);
router.get(
  ROUTES_ENUM.ADMIN.GET_UPCOMING_APPOINTMENTS,
  auth,
  ...getAppointmentsValidationRules,
  validate,
  upcomingAppointmentsController
);
router.get(
  ROUTES_ENUM.ADMIN.GET_PAST_APPOINTMENTS,
  auth,
  ...getAppointmentsValidationRules,
  validate,
  pastAppointmentsController
);
router.get(
  ROUTES_ENUM.ADMIN.GET_PAYMENT_RECORD,
  auth,
  ...getAppointmentsValidationRules,
  validate,
  paymentRecordController
);
router.delete(
  ROUTES_ENUM.ADMIN.DELETE_APPOINTMENT,
  auth,
  ...deleteAppointmentValidationRules(),
  validate,
  deleteAppointmentController
);
router.post(
  ROUTES_ENUM.ADMIN.RESET_PASSWORD,
  // auth,
  ...resetPasswordValidationRules(),
  validate,
  resetPasswordController
);
router.get(
  ROUTES_ENUM.ADMIN.ALL_DASHBOARD_COUNT,
  auth,
  // validate,
  allDashboardCount
);

module.exports = router;
