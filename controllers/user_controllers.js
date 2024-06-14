require("dotenv").config()
const bcrypt = require("bcryptjs");

const connection = require("../services/db");
const { checkEmailValid } = require("../utils/email")
const { checkDateValid, formatDateToYYYYMMDD } = require("../utils/date")
const SALT_ROUNDS = 8
const genders = ["Male", "Female", "Other"]

exports.getAllUsers = async (req, res) => {
	const { email, password } = req.body;
	try {
		const [rows, fields] = await connection.query(
			"SELECT * FROM customers"
		);
		console.log(rows);
		console.log(fields);
		res.status(200).json({
			success: true,
			data: rows
		});
	} catch (err) {
		console.error("Error executing query:", err);
		res.status(500).json({
			success: false,
			message: "Database query error",
			error: err.message
		});
	}
};

exports.register = async (req, res) => {
	try {
		const { email, password, confirmPassword, gender, dob, phoneNumber } = req.body

		if (password !== confirmPassword)
			return res.status(400).json({
				success: false,
				message: "Password and confirmation not matched"
			})
		if (password.length < 8 || password.length > 16 || password.includes(" "))
			return res.status(400).json({
				success: false,
				message: "Password is invalid or contains spaces"
			})

		// check email validation
		if (!checkEmailValid(email))
			return res.status(400).json({
				success: false,
				message: "Invalid email"
			})

		// check gender
		if (genders.indexOf(gender) == -1)
			return res.status(400).json({
				success: false,
				message: "Invalid gender"
			})

		// check dob
		if (!checkDateValid(dob))
			return res.status(400).json({
				success: false,
				message: "Invalid dob"
			})
		// Convert DOB to YYYY-MM-DD format
		const formattedDob = formatDateToYYYYMMDD(dob);

		const passHashed = await bcrypt.hash(password, SALT_ROUNDS)
		console.log(`${password} \n${passHashed}`);
		const [results] = await connection.query(
			"INSERT INTO customers (email, password, phone_number, dob, gender) values (?, ?, ?, ?, ?)",
			[email, passHashed, phoneNumber, formattedDob, gender]
		)
		console.log(results);
		return res.status(201).json({
			success: true,
			message: "Account registered"
		})
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Database query error",
			error: error.message
		})
	}
}
