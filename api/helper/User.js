
class User {
  user_type_id;
  user_id;
  user_type_ids = {
    SUPER_ADMIN: '1',
    // ADMIN: '2, ...', // Except others [1,3,4,5]
    DOCTOR: '3',
    PATIENT: '4',
    REPRESENTATIVE: '5',
  }
  user_roles = ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PATIENT', 'REPRESENTATIVE']

  constructor(user_type_id, user_id) {
    this.user_type_id = user_type_id;
    this.user_id = user_id;
  }

  /**
   *
   * @param ROLE {'DOCTOR', 'PATIENT', 'ADMIN', 'SUPER_ADMIN', 'REPRESENTATIVE'}
   * @returns {boolean}
   * @deprecated
   */
  is(ROLE) {
    return this.user_type_id.toString() === this.user_type_ids[ROLE]
  }

  /**
   *
   * @param args {'DOCTOR', 'PATIENT', 'ADMIN', 'SUPER_ADMIN', 'REPRESENTATIVE'}
   * @returns {boolean}
   */
  isOneOf(...args) {
    let cond = false;
    for (let i = 0; i < args.length; i++) {
      cond = this.user_type_id.toString() === this.user_type_ids[args[i]]
      if(cond) break;
    }
    return cond;
  }

  /**
   *
   * @param ROLE {'DOCTOR', 'PATIENT', 'ADMIN', 'REPRESENTATIVE'}
   * @returns {boolean}
   */
  isNot(ROLE) {
    return this.user_type_id.toString() !== this.user_type_ids[ROLE]
  }

  /**
   *
   * @returns {string}
   */
  getRoleName() {
    let roleName = Object.keys(this.user_type_ids).find((key) => {
      if (this.user_type_ids[key] === this.user_type_id.toString()) {
        return key;
      }
    })
    if(!roleName) {
      roleName = 'ADMIN';
    }
    return roleName;
  }

  /**
   *
   * @returns FieldForAppointmentTable {string}
   */
  fieldForAppointmentTable() {
    const roleName = this.getRoleName()
    let field = roleName.toLowerCase() + '_id';

    // Changing if the role name is REPRESENTATIVE
    if(roleName === this.user_roles[4]) {
      field = 'agent_id';
    }

    return field;
  }
}

/**
 *
 * @param user_type_id
 * @param user_id
 * @returns {User}
 */
module.exports.user = function({user_type_id, user_id}) {
  return new User(user_type_id, user_id);
}
