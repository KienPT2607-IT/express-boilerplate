const accountUtils = require("../utils/account_utils")
const { formatDateToYYYYMMDD } = require("../utils/date_utils")
const connection = require("../services/DBServices");

const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 8;

async function registerNewAccount(email, password, phone_number, dob, gender,) {
	try {
		const formattedDob = formatDateToYYYYMMDD(dob);
		const passHashed = await bcrypt.hash(password, SALT_ROUNDS);
		const [result] = await connection.query(
			"INSERT INTO customers (email, password, phone_number, dob, gender) VALUES (?, ?, ?, ?, ?)",
			[email, passHashed, phone_number, formattedDob, gender.toLowerCase()]
		);
		if (!result)
			return false;
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
	if (!checkEmailValid(email) || !password.trim())
		return false
	return true
}

module.exports = {
	validateRegisterInputs,
	validateLoginInputs,
	registerNewAccount,
	isEmailExisted,
	isPhoneNumberExisted
}