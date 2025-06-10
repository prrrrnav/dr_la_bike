module.exports.sendResponseInJson = function (res, status_code, status_message, result) {
  return res.status(200).json({status_code, status_message, result});
}
