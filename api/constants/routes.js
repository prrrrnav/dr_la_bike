module.exports.ROUTES_ENUM = {
  ADMIN: {
    BASE: '/admin',
    GET_DOCTORS: '/getDoctorList/:camp_id?/:page?/:limit?',
    GET_AGENTS: '/getAgentList/:page?/:limit?',
    GET_PATIENTS: '/getPatientList/:camp_id?/:page?/:limit?',
    GET_ADMINS: '/getAdminList/:camp_id?/:page?/:limit?',
    ADD_PATIENT: '/addPatient',
    ADD_ADMIN: '/addAdmin',
    GET_UPCOMING_APPOINTMENTS: '/appointment/upcoming/:page?/:limit?/:camp_id?',
    GET_PAST_APPOINTMENTS: '/appointment/past/:page?/:limit?/:camp_id?',
    GET_PAYMENT_RECORD: '/payment/:page?/:limit?/:camp_id?',
    DELETE_APPOINTMENT: '/appointment/delete/:appointment_id?',
    RESET_PASSWORD: '/resetPassword',
    ALL_DASHBOARD_COUNT: '/dashboard/count'
  },
  USER: {
    BASE: '/user',
    CREATE_ROLE: '/createRole',
    UPDATE_ROLE: '/updateRole/:id?',
    // UPDATE_ROLE_STATUS: '/updateRoleStatus/:id',
    SEND_OTP: '/sendOtp',
    VERIFY_OTP: '/verifyOtp/:emailPhone?/:otp?',
    CHECK_EXIST_USER: '/checkExistUser/:emailPhone?/:type?',
    PATIENT_SIGN_IN: '/patientSignIn',
    GENERATE_SESSION_TOKEN: '/generateSessionToken',
    LOGOUT: '/logout/:uuid?'
  }
}
