require("dotenv").config();
const jwt = require("jsonwebtoken");

const redisClient = require("../services/RedisClientServices")
const {
	validateRegisterInputs,
	validateLoginInputs,
	registerNewAccount,
	isEmailExisted,
	isPhoneNumberExisted,
	getCustomerAccount,
	isPasswordMatched,
	generateCustomerAuthToken,
	logoutUser
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
		const { email, password } = req.body

		const accountValidationResult = validateLoginInputs(email, password)
		if (!accountValidationResult)
			return res.status(400).json({
				success: accountValidationResult,
				message: "Invalid account!"
			})

		const customerAccount = await getCustomerAccount(email)
		if (!customerAccount)
			return res.status(404).json({
				success: false,
				message: "Account does not exist!"
			})
		const isPassMatched = isPasswordMatched(password, customerAccount.password)
		if (!isPassMatched)
			return res.status(400).json({
				success: false,
				message: "Invalid password!",
			});

		const token = generateCustomerAuthToken(customerAccount.id)
		return res.status(200).json({
			success: true,
			message: "Logged in successfully!",
			data: {
				auth_token: token,
				name: ((customerAccount.email).split("@"))[0],
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Database query error!",
			error: error.message,
		});
	}
};

exports.logout = async (req, res) => {
	try {
		const result = await logoutUser(req.auth_token)
		if (!result)
			return res.status(500).json({
				success: !result,
				message: "Server error, cannot invalidate token!"
			})
		return res.status(200).json({
			success: true,
			message: "Logged out successfully!"
		})
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Server error!"
		})
	}
}