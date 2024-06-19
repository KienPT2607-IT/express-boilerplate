require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redisClient = require("../services/RedisClientServices")
const {
	validateRegisterInputs,
	validateLoginInputs,
	registerNewAccount,
	isEmailExisted,
	isPhoneNumberExisted
} = require("../services/AccountServices");

const connection = require("../services/DBServices");



exports.getAllUsers = async (req, res) => {
	try {
		const [rows, fields] = await connection.query("SELECT id, email, gender, dob, phone_number, is_active, create_at, modify_at FROM customers");
		console.log(rows);
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
		const { email, password, confirm_password, gender, dob, phone_number } = req.body;
		if (!validateRegisterInputs(
			email,
			password,
			confirm_password,
			gender,
			dob,
			phone_number
		))
			return res.status(400).json({
				success: false,
				message: "Invalid account information!"
			});
		if (await isEmailExisted(email))
			return res.status(400).json({
				success: false,
				message: "Duplicated email!",
			});
		if (await isPhoneNumberExisted(phone_number))
			return res.status(400).json({
				success: false,
				message: "Duplicated phone number!",
			});
		const result = await registerNewAccount(email, password, phone_number, dob, gender)
		if (!result)
			return res.status(400).json({
				success: false,
				message: "Cannot register new account!",
			});
		return res.status(201).json({
			success: true,
			message: "Account registered!",
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Server error!",
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
		const token = jwt.sign(
			{ id: result[0].id },
			process.env.JWT_TOKEN_SECRET_KEY,
			{ expiresIn: "1d" }
		);
		return res.status(200).json({
			success: true,
			message: "Logged in successfully",
			data: {
				auth_token: token,
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

exports.logout = async (req, res) => {
	try {
		if (!redisClient.isReady)
			await redisClient.connect();

		const token = req.auth_token
		const tokenDecoded = jwt.decode(token)
		const ttl = tokenDecoded.exp - Math.floor(Date.now() / 1000)

		await redisClient.set(token, 'blacklisted', { EX: ttl });
		res.status(200).json({
			success: true,
			message: "Logged out successfully!"
		})
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			message: "Server error!"
		})
	}
}