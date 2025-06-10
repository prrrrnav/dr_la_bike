const {constants} = require("../constants");
/**
 *
 * @param user_type_id
 * @param ROLE {'DOCTOR', 'PATIENT', 'ADMIN', 'REPRESENTATIVE'}
 * @returns {boolean}
 * @deprecated
 */
module.exports.isUserA = function(user_type_id, ROLE) {
  return user_type_id.toString() === constants.user_type_ids[ROLE]
}
