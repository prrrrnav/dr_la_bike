var mysql = require("mysql");
const config = require('../config/config');
var con = mysql.createConnection({
	host: config.db.host,
	port: config.db.port,
	user: config.db.username,
	password: config.db.password,
	database: config.db.database
});
con.connect(function (err) {
	if (err) {
		throw err;
	};
	console.log('Database.js:- connected successfully.');
});
con.execQuery = async function (sql) {
	return new Promise((resolve, reject) => {
		con.query(sql, (err, result) => {
			if (err) reject(err);
			resolve(result);
		});
	});
};
con.inputQuery = async function (sql, params) {
	return new Promise((resolve, reject) => {
		con.query(sql, params, (err, result) => {
			if (err) reject(err);
			resolve(result);
		});
	});
};

module.exports = con;
