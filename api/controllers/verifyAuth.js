const jwt = require('jsonwebtoken');
const config = require('../config/config');
const db = require('../helper/database');
const moment = require('moment-timezone');

const verifyToken = async (req, res, next) => {
  const unauthorizedJson = { code: 401, 'message': 'Not Authorized', data: {} };
  try {
    const token =
      req.headers['x-auth-token'] || req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
      return res.status(403).send(unauthorizedJson);
    }
    req.user = jwt.verify(token, config.jwt.jwtApiSecret);
    // const query = 'SELECT user_type_id FROM users WHERE'
    const query = `
      SELECT tok.id, tok.disabled, users.user_type_id, users.users_id
      FROM user_access_tokens as tok
      INNER JOIN users
      ON tok.uuid = users.uuid AND users.uuid = '${req.user.sub}'
      ORDER BY tok.id DESC;
    `;
    // const query = 'SELECT * FROM user_access_tokens WHERE uuid = \"' + req.user.sub + '\" ORDER BY `id` DESC';
    db.query(query, function (error, rows) {
      if (error) {
        res.json(unauthorizedJson);
      } else {
        if (rows.length > 0 && rows[0].disabled == 0) {
          req.userDetails = {
            user_type_id: rows[0].user_type_id.toString(),
            user_id: rows[0].users_id.toString()
          };
          const updateDate = db.query('UPDATE user_access_tokens SET last_used_at = \'' + moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") + '\' WHERE uuid = \'' + req.user.sub[0] + '\'', function (err, rows, fields) {
            if (rows) {
              next();
            } else {
              res.json(unauthorizedJson);
            }
          });
        } else {
          res.json(unauthorizedJson);
        }
      }
    })
  } catch (err) {
    res.json(unauthorizedJson);
  }
}

module.exports = verifyToken;
