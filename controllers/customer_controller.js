require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const connection = require("../services/db");
const { validateRegisterInputs, validateLoginInputs } = require("../services/account_services");

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

		const validationResult = validateRegisterInputs(email, password, confirmPassword, gender, dob, phoneNumber)
		if (!validationResult.success)
			return res.status(400).json(validationResult);

		// Convert DOB to YYYY-MM-DD format
		const formattedDob = formatDateToYYYYMMDD(dob);
		const passHashed = await bcrypt.hash(password, SALT_ROUNDS);
		const [results] = await connection.query(
			"INSERT INTO customers (email, password, phone_number, dob, gender) values (?, ?, ?, ?, ?)",
			[email, passHashed, phoneNumber, formattedDob, gender.toLowerCase()]
		);
		console.log(results);
		return res.status(201).json({
			success: true,
			message: "Account registered",
		});
	} catch (error) {
		if (error.code === "ER_DUP_ENTRY")
			return res.status(400).json({
				success: false,
				message: "Some fields duplicated",
			})

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
		const validationResult = validateLoginInputs(email, password)
		if (!validationResult.success)
			return res.status(400).json(validationResult);
		const [result] = await connection.query(
			"SELECT id, email, password FROM customers WHERE email = ? LIMIT 1",
			[email]
		);
		if (result.length == 0)
			return res.status(404).json({
				success: false,
				message: "This account does not exist"
			})
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
				name: (result[0].email.split("@"))[0],
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
