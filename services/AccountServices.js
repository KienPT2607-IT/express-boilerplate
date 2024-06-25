require('dotenv').config();
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const redisClient = require("../services/RedisClientServices")

const accountUtils = require("../utils/account_utils")
const { formatDateToYYYYMMDD } = require("../utils/date_utils")
const connection = require("../services/DBServices");
const SALT_ROUNDS = 8;
const TOKEN_EXP_TIME = "1d"

async function registerNewAccount(email, password, phone_number, dob, gender,) {
	try {
		const formattedDob = formatDateToYYYYMMDD(dob);
		const passHashed = await bcrypt.hash(password, SALT_ROUNDS);
		const [result] = await connection.query(
			"INSERT INTO customers (email, password, phone_number, dob, gender, role) VALUES (?, ?, ?, ?, ?, ?)",
			[email, passHashed, phone_number, formattedDob, gender.toLowerCase(), 3]
		);
		if (!result) return false;
		return true;
	} catch (error) {
		return false
	}
}

async function isEmailExisted(email) {
	const [results] = await connection.query(
		"SELECT email FROM customers WHERE email = ? LIMIT 1",
		[email]
	)
	if (results.length == 1)
		return true
	return false
}

async function isPhoneNumberExisted(phone_number) {
	try {
		const [result] = await connection.query(
			"SELECT phone_number FROM customers WHERE phone_number = ?",
			[phone_number]
		)
		if (result.length == 1) return true
		return false
	} catch (error) {
		return false
	}
}

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @param {string} confirmPassword 
 * @param {string} gender 
 * @param {string} dob 
 * @returns 
 */
function validateRegisterInputs(email, password, confirmPassword, gender, dob) {
	if (!accountUtils.checkEmailValid(email)
		|| !accountUtils.checkPasswordsValid(password)
		|| !accountUtils.checkPasswordConfirmValid(password, confirmPassword)
		|| !accountUtils.checkGenderValid(gender.toLowerCase())
		|| !accountUtils.checkDateValid(dob)
	)
		return false
	return true
}

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns 
 */
function validateLoginInputs(email, password) {
	if (
		!accountUtils.checkEmailValid(email)
		|| !password.trim()
	) return false
	return true
}

async function getCustomerAccount(email) {
	try {
		const [result] = await connection.query(
			`SELECT customers.id, roles.name as role, email, password 
			FROM customers 
			INNER JOIN roles ON customers.role = roles.id
			WHERE email = ? 
			LIMIT 1`,
			[email]
		);
		if (!result) return null
		return result[0]
	} catch (error) {
		return null
	}
}

async function getStaffAccount(email) {
	try {
		const [result] = await connection.query(
			`SELECT staffs.id, roles.name as role, email, password 
			FROM staffs 
			INNER JOIN roles ON staffs.role = roles.id 
			WHERE email = ? 
			LIMIT 1`,
			[email]
		);
		if (!result) return null
		return result[0]
	} catch (error) {
		return null
	}
}

async function isPasswordMatched(password, passHashed) {
	try {
		const isPassMatched = await bcrypt.compare(
			password,
			passHashed
		);
		if (!isPassMatched) return false
		return true
	} catch (error) {
		return false
	}
}

const generateAuthToken = (id, role) => jwt.sign(
	{ id: id, role: role },
	process.env.JWT_TOKEN_SECRET_KEY,
	{ expiresIn: TOKEN_EXP_TIME }
);

async function logoutUser(token) {
	try {
		if (!redisClient.isReady) await redisClient.connect();

		const tokenDecoded = jwt.decode(token)
		const ttl = tokenDecoded.exp - Math.floor(Date.now() / 1000)

		await redisClient.set(token, 'blacklisted', { EX: ttl });
		return true;
	} catch (error) {
		return false;
	}
}

module.exports = {
	validateRegisterInputs,
	validateLoginInputs,
	registerNewAccount,
	isEmailExisted,
	isPhoneNumberExisted,
	getCustomerAccount,
	getStaffAccount,
	isPasswordMatched,
	generateAuthToken,
	logoutUser,
}