console.log("Server.js:- Starting app.");
const express = require("express"),
  bodyParser = require("body-parser"),
  //   http = require('http'),
  http = require("https"),
  fs = require("fs");
const app = express();
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const db = require("./helper/database");
const cors = require("cors");
app.use(helmet());
const router = require("./routes/router");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const config = require("./config/config");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const moment = require("moment-timezone");
const { ROUTES_ENUM } = require("./constants/routes");
const { handleServerError } = require("./middlewares/middlewares");
// const schedule = require('node-schedule');

// const rule = new schedule.RecurrenceRule();

// rule.minute = new schedule.Range(0, 10);

// const job = schedule.scheduleJob('*/1 * * * * *', (fireDate) => {
//   console.log( fireDate );
// });
require("dotenv").config();

module.exports = app;
const swaggerOption = {
  swaggerDefinition: {
    info: {
      title: "La-Bike",
      description: "La-Bike api information for integration",
      contact: {
        name: "Amazing Developer",
      },
      servers: ["https://localhost:3001"], //config.api.baseurl]
    },
    // security: [ { bearerAuth: {type: 'apiKey',
    // name: 'x-auth-token',
    // scheme: 'bearer',
    // in: 'header'} } ],
  },
  apis: ["./controllers/*.js"],
};

// process.on("uncaughtException", function(err) {
//     debugger
//     // clean up allocated resources
//     // log necessary error details to log files
//     process.exit(); // exit the process to avoid unknown state
// });
const swaggerDocs = swaggerJsDoc(swaggerOption);
router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// const __stack;
Object.defineProperty(global, "__stack", {
  get: function () {
    // const orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };
    const err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    // const stack = err.stack;
    // Error.prepareStackTrace = orig;
    return err.stack;
  },
});

Object.defineProperty(global, "__line", {
  get: function () {
    return __stack[1].getLineNumber();
  },
});

Object.defineProperty(global, "__fileName", {
  get: function () {
    return __stack[1].getFileName().split("\\").pop();
  },
});

// Object.prototype.omitUndefined = function () {
//   const newObj = Object.assign({}, this);
//   Object.keys(newObj).forEach(key => {
//     if (newObj.hasOwnProperty(key)) {
//       if (newObj[key] === undefined || newObj[key] === null) {
//         delete newObj[key];
//       }
//     }
//   });
//   return newObj;
// };

app.use(cors());
const key = fs.readFileSync("./config/server/drlabike.key", "utf8");
const cert = fs.readFileSync("./config/server/drlabike.crt", "utf8");
const ca = fs.readFileSync("./config/server/gd_bundle-g2-g1.crt", "utf8");
const options = {
  key: key,
  cert: cert,
  ca:ca
};
// const options ={};
app.use("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,OPTIONS,PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-type,Accept,X-Access-Token,X-Key,Authorization,X-AUTH-TOKEN,uuid,Origin, X-Requested-With"
  );
  if (req.method == "OPTIONS") {
    res.status(200).end();
  } else {
    next();
  }
});
// app.use('/*', function(req, res, next) {
//   const noAuthPaths = [
//       '/api-docs',
//       '/api-docs/swagger-ui.css',
//       '/api-docs/swagger-ui-bundle.js',
//       '/api-docs/swagger-ui-standalone-preset.js',
//       '/api-docs/swagger-ui-init.js',
//       '/user/sendOtp',
//       '/admin/login',
//       '/patient/signUp',
//       '/user/patientSignIn'
//     //   ,'/video/call?/list'
//   ];
//   const noAuthurls = [
//     '/user/verifyOtp/',
//     '/user/checkExistUser/',
//     '/admin/forgot/password/'
//   ];
//   const check_validate_token = true;
//   for (const i = 0; i < noAuthPaths.length; i++) {
//       if (noAuthPaths[i] == req.baseUrl) {
//           check_validate_token = false;
//           break;
//       }
//   }
//   if(check_validate_token){
//   for (const j = 0; j < noAuthurls.length; j++) {
//     //   console.log(req.baseUrl,'pankaj');
//     //   console.log(noAuthurls[j]);
//     //   console.log(req.baseUrl.indexOf(noAuthurls[j]));
//       if (req.baseUrl.indexOf(noAuthurls[j])>-1) {
//           check_validate_token = false;
//           break;
//       }
//   }
// }
// // console.log(check_validate_token);
//   if (check_validate_token) {
//       const Badrequestjson = { code: 401, 'message': 'Bad Request - Authentication Information was not supplied', data: {} };
//       const unauthorizedJson = { code: 401, 'message': 'Unauthorised', data: {} };
//       if (req.headers['x-auth-token']) {
//           const token = req.headers['x-auth-token'];
//           try {
//               const decoded = jwt.verify(token, config.jwt.jwtApiSecret);
//               req.user = decoded;
//               const query = 'SELECT * FROM user_access_tokens WHERE uuid = \"' + req.user.sub + '\" ORDER BY `id` DESC';
//               db.query(query, function(error, rows) {
//                   if (error) {
//                       res.json(unauthorizedJson);
//                   } else {
//                       if (rows.length > 0 && rows[0].disabled == 0) {
//                           const updateDate = db.query('UPDATE user_access_tokens SET  last_used_at = \'' + moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") + '\' WHERE uuid = \'' + req.user.sub[0] + '\'', function(err, rows, fields) {
//                               if (rows) {
//                                   next();
//                               } else {
//                                   res.json(unauthorizedJson);
//                               }
//                           });
//                       } else {
//                           res.json(unauthorizedJson);
//                       }
//                   }
//               })
//           } catch (err) {
//               res.json(unauthorizedJson);
//           }
//       } else {
//           res.json(Badrequestjson);
//       }
//   } else {
//       next();
//   }
// });
//app.use(express.static(__dirname + '/uploads'));
app.use(router);
app.use(ROUTES_ENUM.ADMIN.BASE, adminRoutes);
app.use(ROUTES_ENUM.USER.BASE, userRoutes);
// app.use('/doctor', doctorRoutes);

app.use(handleServerError);

const httpserver = http.createServer(options, app);

// io = require('socket.io')(httpserver);
// io.on('connect',function(socket) {
//   console.log('a user connected');
//    socket.on('makeCall', function(data) {
//         socket.broadcast.emit('makeCall', data);
//     });
//     socket.on('scheduleAppointment', function(data) {
//         socket.broadcast.emit('scheduleAppointment', data);
//     });
//     socket.on('acceptCall', function(data) {
//       socket.broadcast.emit('acceptCall', data);
//   });
//      socket.on('callDisConnectByPet', function(data) {
//         socket.broadcast.emit('callDisConnectByPet', data);
//     });
//      socket.on('callDisConnectByVet', function(data) {
//         socket.broadcast.emit('callDisConnectByVet', data);
//     });
// });
httpserver
  .listen(config.app.port, function () {
    console.log("Api server Started at port:" + config.app.port);
  })
  .setTimeout(0);
// httpserver.listen(3001, function () {
//   console.log('Api server Started at port:' + 3001);
// }).setTimeout(0);
