const db = require("../helper/database");
const logger = require("../middlewares/logger");
const { sendResponseInJson } = require("../utils/utils");

module.exports.setModuleAssignId = async function (req, res, next) {
  const { role } = req.query;
  const type = await db.execQuery(`SELECT module_assign_id FROM module_assign WHERE role = '${role}'`);
  if (type.length <= 0) {
    // logger.error(pathName, 'check user type exist:', __line);
    return res.status(200).json({ "status_code": 400, "status_message": "Please contact administrator for creating user type." });
  }
  res.locals.module_assign_id = type[0].module_assign_id;
  next();
}

exports.handleServerError = function (err, req, res, next) {
  // const {fnName, fileName, line} = res.locals.err_obj;

  // Error.prepareStackTrace = (_, stack) => stack;
  // Error.captureStackTrace(err.stack);
  // // const stack = err.stack;

  // // Array.from(err.stack).forEach((key, ind) => {
  // //   console.log(err.stack[ind].getFileName(), '--- ' + ind);
  // // })

  // const fnName = err.stack[0].getFunctionName();
  // const fileName = err.stack[0].getFileName();
  // const lineNumber = err.stack[0].getLineNumber();


  // logger.error(fnName, ':', fileName + ':' + lineNumber + ' - ', err);
  return sendResponseInJson(res, 500, 'Internal Server Error');
}


// module.exports.handleServerError = function (res, err) {
//   // const {fnName, fileName, line} = res.locals.err_obj;
//   // console.log(err);
//   Error.prepareStackTrace = (a, stack) => {
//     // console.log(a);
//     return stack;
//   };
//   Error.captureStackTrace(err.stack);
//   // console.log(e.stack);
//   // console.log(e.stack[1].getLineNumber());
//   // console.log(e.stack[1].getFunctionName());
//
//   // console.log('Line 20. ', err.stack, 'End --- ');
//   // // Error.prepareStackTrace = (_, stack) => stack;
//   // // Error.captureStackTrace(err.stack);
//   // const stack = err.stack;
//   // Array.from(err.stack).forEach((key, ind) => {
//   // })
//   const fnName = err.stack[0].getFunctionName();
//   const fileName = err.stack[0].getFileName();
//   const lineNumber = err.stack[0].getLineNumber();
//   console.log(fnName, fileName, lineNumber, '--- ');
//
//
//   logger.error(fnName, ':', fileName + ':' + lineNumber + ' - ', err);
//   return sendResponseInJson(res, 500, 'Internal Server Error');
// }
