require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const connection = require("../services/db");
const { validateInputs } = require("../services/account_services");
const { responseHandler } = require("../services/http_response");

const { formatDateToYYYYMMDD } = require("../utils/date_utils");

const SALT_ROUNDS = 8;

exports.getAllUsers = async (req, res) => {
	const { email, password } = req.body;
	try {
		const [rows, fields] = await connection.query("SELECT * FROM customers");
		console.log(rows);
		console.log(fields);
		res.status(200).json({
			success: true,
			data: rows,
		});
	} catch (err) {
		console.error("Error executing query:", err);
		res.status(500).json({
			success: false,
			message: "Database query error",
			error: err.message,
		});
	}
};

exports.register = async (req, res) => {
	try {
		const { email, password, confirmPassword, gender, dob, phoneNumber } = req.body;

		const validationResult = validateInputs(email, password, confirmPassword, gender, dob, phoneNumber)
		// Check validation for password
		if (!validationResult.success) 
			return res.status(400).json(validationResult);
		
		// Convert DOB to YYYY-MM-DD format
		const formattedDob = formatDateToYYYYMMDD(dob);
		const passHashed = await bcrypt.hash(password, SALT_ROUNDS);
		const [results] = await connection.query(
			"INSERT INTO customers (email, password, phone_number, dob, gender) values (?, ?, ?, ?, ?)",
			[email, passHashed, phoneNumber, formattedDob, gender]
		);
		console.log(results);
		return res.status(201).json({
			success: true,
			message: "Account registered",
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			message: "Database query error",
			error: error.message,
		});
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!checkEmailValid(email))
			return res.status(400).json({
				success: false,
				message: "Invalid email",
			});
		const [result] = await connection.query(
			"SELECT * FROM customers WHERE email = ? LIMIT 1",
			[email]
		);

		const isPassMatched = await bcrypt.compare(password, result[0].password);
		if (!isPassMatched)
			return res.status(400).json({
				success: false,
				message: "Invalid password",
			});
		const token = jwt.sign({ id: result[0].id }, process.env.JWT_SECRET_KEY);
		return res.status(200).json({
			success: true,
			message: "Logged in successfully",
			data: {
				token: token,
				email: result[0].email,
				gender: result[0].gender,
				dob: result[0].dob,
				phone_number: result[0].phone_number,
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Database query error",
			error: error.message,
		});
	}
};
