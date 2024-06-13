const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const connection = require("../utils/db");

exports.getAllUsers = async (req, res) => {
	const { email, password } = req.body;
	try {
		const [rows, fields] = await connection.query(
			"SELECT * FROM customers"
		);
		console.log(rows);
		console.log(fields);
		res.json(rows);
	} catch (err) {
		console.error("Error executing query:", err);
		res.status(500).send("Database query error");
	}
};
