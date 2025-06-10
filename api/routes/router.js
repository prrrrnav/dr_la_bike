const express = require("express");
const app = express.Router();
const user = require("../controllers/user");
const patient = require("../controllers/patient");
const doctor = require("../controllers/doctor");
const camp = require("../controllers/camp");
const common = require("../controllers/common");
const auth = require("../controllers/verifyAuth");
const multer = require("multer");
const { setModuleAssignId } = require("../middlewares/middlewares");
const {
  searchUser,
  searchCamp,
  searchAppointment,
  searchCallLog,
  searchRatings,
  searchSpeciality,
  changePassword,
  searchCallQueue,
  getCreditByUserId,
  postCreditApi,
  fetchCreditHistory,
  searchPayments,
  postPayment,
  deductCredit,
} = require("../controllers/apiController");
const { sendResponseInJson } = require("../utils/utils");
const { body } = require("express-validator");
const { validate } = require("../helper/validator");
const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});
const multipleUpload = multer({
  storage: storage,
  onFileUploadStart: function (file) {
    console.log(file.originalname + " is starting ...");
  },
  fileFilter: function (req, file, callback) {
    callback(null, true);
  },
}).any("file[]", 10);
const singleUpload = multer({ storage }).single("image");

app.post("/upload/singlefile", auth, common.uploadSinglefile);
app.post(
  "/upload/multiplefile",
  auth,
  multipleUpload,
  common.uploadMultiplefile
);
app.post("/common/createPaymentIntent", auth, common.createPaymentIntent); // deduct payment api
app.post("/common/getRtcAccessToken", auth, common.getRtcAccessToken); // for agora video call
app.put("/user/updateAppLanguage/:id", auth, common.updateAppLanguage);

// app.post('/user/createRole', auth, user.createRole);
// app.put('/user/updateRolePermission/:id', auth, user.updateRolePermission);
// app.put('/user/updateRoleStatus/:id', auth, user.updateRoleStatus);
app.post("/admin/login", user.adminLogin);
app.get(
  "/user/getAllEarningReport/:page?/:limit?",
  auth,
  user.getAllEarningReport
);
// app.post('/user/sendOtp', user.sendOtp);
// app.get('/user/verifyOtp/:emailPhone/:otp', user.verifyOtp);
// app.get('/user/checkExistUser/:emailPhone/:type', user.checkExistUser);
// app.post('/user/patientSignIn', user.patientSignIn);
// app.get('/user/generateSessionToken', auth, user.generateSessionToken);
// app.get('/user/logout/:uuid', auth, user.logout);

// app.get('/admin/getDoctorList/:camp_id?/:page?/:limit?', auth, user.getDoctorList);
// app.get('/admin/getAgentList/:page?/:limit?', auth, user.getAgentList);
// app.get('/admin/getPatientList/:camp_id?/:page?/:limit?', auth, user.getPatientList);
// app.get('/admin/getAdminList/:camp_id?/:page?/:limit?', auth, user.getAdminList);
// app.post('/admin/addPatient', auth, user.addPatient);
// app.post('/admin/addAdmin', auth, user.addAdmin);
// app.get('/admin/appointment/upcoming/:page/:limit/:camp_id', auth, user.upcomingAppointments);
// app.get('/admin/appointment/past/:page/:limit/:camp_id', auth, user.pastAppointments);
// app.get('/admin/payment/:page/:limit/:camp_id', auth, user.paymentRecord);
// app.delete('/admin/appointment/delete/:appointment_id', auth, user.deleteAppointment);
// app.post('/admin/resetPassword', auth, user.resetPassword);
app.get(
  "/patient/payment/:page/:limit/:patient_id",
  auth,
  patient.getPaymentRecord
);
app.get("/patient/measurements/:oxitone_id", auth, patient.measurements);
app.post("/patient/test1", patient.test1);

app.get(
  "/api/search-user/:page?/:limit?",
  auth,
  setModuleAssignId,
  searchUser
  // handleResponse(),
);

app.post(
  "/api/change-password",
  auth,
  body("oldPassword").exists().withMessage("Old password is missing"),
  body("newPassword")
    .exists()
    .withMessage("New password is missing")
    .isStrongPassword({
      minLowercase: 1,
      minUppercase: 1,
      minSymbols: 1,
      minNumbers: 1,
      minLength: 8,
    })
    .withMessage(
      "Password length must be in between 8 and 16, 1 Uppercase Letter, 1 Lowercase Letter, 1 Numeric, 1 Symbolic Character."
    ),
  validate,
  changePassword
);

app.get("/api/search-camp/:page?/:limit?", auth, searchCamp);
app.get("/api/search-appointment/:page?/:limit?", auth, searchAppointment);
app.get("/api/search-speciality/:page?/:limit?", auth, searchSpeciality);
app.get("/api/search-ratings/:page?/:limit?", auth, searchRatings);
app.get("/api/search-calllog/:page?/:limit?", auth, searchCallLog);
app.get("/api/search-payments/:page?/:limit?", auth, searchPayments);
app.get("/api/search-call-queue/:page?/:limit?", auth, searchCallQueue);

app.post(
  "/api/payment",
  auth,
  body("payment_id").exists().withMessage("payment_id is missing"),
  body("amount")
    .exists()
    .withMessage("amount is missing")
    .isNumeric()
    .withMessage("Amount must be in digits"),
  validate,
  postPayment
);
app.post(
  "/api/payment/call",
  auth,
  body("agent_id").exists().withMessage("agent_id is missing"),
  body("call_id").exists().withMessage("call_id is missing"),
  body("patient_id").exists().withMessage("patient_id is missing"),
  body("doctor_id").exists().withMessage("doctor_id is missing"),
  validate,
  deductCredit
);
app.post(
  "/admin/api/credit",
  auth,
  body("updated_for").exists().withMessage("updated_for is missing"),
  body("amount")
    .exists()
    .withMessage("Amount is missing")
    .isNumeric()
    .withMessage("Amount must be in digits"),
  validate,
  postCreditApi
);

app.get("/api/credits", auth, getCreditByUserId);
app.get("/api/credits/history/:page?/:limit?", auth, fetchCreditHistory);

// app.get('/api/search-callqueue/:page?/:limit?', auth, searchCallLog);

app.get("/patient/Search/:page/:limit/:name?", auth, patient.search);
app.post("/patient/signUp", patient.signUp);
app.put("/patient/updateProfile/:uuid", auth, patient.updateProfile);
app.post("/appointment/schedule", auth, patient.schedule);
app.post("/appointment/reSchedule", auth, patient.reSchedule);
app.post("/appointment/cancel", auth, patient.cancel);
app.get(
  "/patient/appointment/upcoming/:patient_id/:page?/:limit?",
  auth,
  patient.upcomingAppointments
);
app.get(
  "/patient/appointment/past/:patient_id/:page?/:limit?",
  auth,
  patient.pastAppointments
);
app.post("/patient/makeCall", auth, patient.makeCall);
app.post("/patient/appointment/makeCall", auth, patient.appointmentMakeCall);
app.get("/patient/specialities/list", auth, patient.specialityList);
app.get("/patient/activity/:patient_id", auth, patient.activity);
app.post("/patient/payment", auth, patient.addPayment);
app.get("/patient/lastcalldetails/:patient_id", auth, patient.lastcalldetails);
app.get("/patient/vitals/:patient_id", auth, patient.getVitals);
app.get("/patient/dashboard/count/:patient_id", auth, patient.dashboardCount);
app.post("/document/add", auth, patient.addDocument);
app.get(
  "/patient/document/:page/:limit/:patient_id",
  auth,
  patient.getDocumentRecord
);

app.post("/doctor/signUp", auth, doctor.signUp);
app.post("/doctor/status-update", doctor.statusUpdateDoctor);
app.post("/representative/signUp", auth, doctor.agentSignUp);
app.get("/doctor/Search/:page/:limit/:speciality/:name?", auth, doctor.search);
app.get("/doctor/availability/:uuid", auth, doctor.getAvailability);
app.get(
  "/doctor/appointment/upcoming/:doctor_id/:page?/:limit?",
  auth,
  doctor.upcomingAppointments
);
app.get(
  "/doctor/appointment/past/:doctor_id/:page?/:limit?",
  auth,
  doctor.pastAppointments
);
app.get("/doctor/callWaitingList/:uuid", auth, doctor.callWaitingList);
app.put("/doctor/update/:uuid", auth, doctor.updateDoctor);
app.put(
  "/doctor/updateAvailability/:uuid",
  auth,
  doctor.updateDoctorAvailability
);
app.put("/agent/update/:uuid", auth, doctor.updateagent);
app.put("/doctor/updated/callStatus", auth, doctor.updateCallStatus);
app.put("/update/doctor/notes", auth, doctor.updatenotes);
app.get("/doctor/notification/:doctor_id", auth, doctor.notification);
app.get(
  "/doctor/getAllocatedTimeSlot/:id/:date",
  auth,
  doctor.getAllocatedTimeSlot
);

app.post("/camp/createPdf", auth, camp.createPdf);
app.post("/camp/downloadPdf", auth, camp.downloadPdf);
app.post("/camp/createCamp", auth, camp.createCamp);
app.get("/camp/Search/:page/:limit/:name?", auth, camp.search);
app.get("/drugs/Search/:page/:limit/:name?", auth, camp.drugsSearch);
app.get("/getPayment/information/:camp_id", auth, camp.getPaymentDetails);
app.get(
  "/agent/appointment/upcoming/:agent_id/:page?/:limit?",
  auth,
  camp.upcomingAppointments
);
app.get(
  "/agent/appointment/past/:agent_id/:page?/:limit?",
  auth,
  camp.pastAppointments
);

app.get("/recently/adduser/:camp_id/:type", auth, camp.recentlyadduserList);
app.get("/camp/allList/:page/:limit", auth, camp.allList);
app.get("/camp/:camp_id", auth, camp.getCampById);
app.put("/camp/activeInactive/:camp_id", auth, camp.updateCampStatus);
app.put("/camp/update/:camp_id", auth, camp.updateCamp);
app.post("/specialities/create", auth, camp.createSpeciality);
app.get("/admin/speciality", auth, camp.specialityallList);
app.post("/admin/add/speciality", auth, camp.createSpeciality);
app.put("/specialities/activeInactive/:id", auth, camp.updateSpecialityStatus);
app.put("/user/activeInactive/:id", auth, camp.updateUserStatus);
app.delete("/specialities/delete/:id", auth, camp.deleteSpeciality);
app.delete("/user/delete/:id", auth, camp.deleteUser);
app.delete("/appointment/delete/:id", auth, camp.deleteAppointment);
app.delete("/camp/delete/:camp_id", auth, camp.deleteCamp);
app.put("/specialities/update/:id", auth, camp.updateSpeciality);
app.get("/admin/callLogs/:page/:limit/:camp_id", auth, camp.callLogsList);
app.get(
  "/patient/callLogs/:page/:limit/:patient_id",
  auth,
  camp.callLogsListbypatient
);
app.get(
  "/patient/medicalHistory/:patient_id",
  auth,
  camp.medicalHistoryByPatientId
);
// app.get('/admin/dashboard/count/:camp_id?', auth, camp.allDashboardCount);
app.post("/admin/forgot/password/:email", camp.forgotPassword);
app.post("/rating/add", auth, camp.addRating);
app.get("/admin/city/:state_id", auth, camp.allCityList);
app.get("/admin/state", auth, camp.allStateList);

module.exports = app;
