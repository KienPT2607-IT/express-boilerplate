const GENDERS = ["male", "female", "other"]

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @param {string} confirmPassword 
 * @param {string} gender 
 * @param {string} dob 
 * @returns 
 */
function validateInputs(email, password, confirmPassword, gender, dob) {
	if (!checkPasswordsValid(password))
		return {
			success: false,
			message: "Password is invalid or contains spaces",
		};
	if (!checkPasswordConfirmValid(password, confirmPassword)) 
		return {
			success: false,
			message: "Password and confirmation not matched",
		};
	if (!checkEmailValid(email)) 
		return {
			success: false,
			message: "Invalid email",
		};
	if (!checkGenderValid(gender.toLowerCase())) 
		return {
			success: false,
			message: "Invalid gender",
		};
	if (!checkDateValid(dob)) 
		return {
			success: false,
			message: "Invalid dob",
		};
	return { success: true };
}

/**
 * 
 * @param {string} email 
 * @returns {boolean} 
 */
function checkEmailValid(email) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

function checkPasswordsValid(password) {
	if (
		password.length < 8
		|| password.length > 16
		|| password.includes(" ")
	) return false
	return true
}

function checkPasswordConfirmValid(password, confirmPassword) {
	if (password !== confirmPassword) return false
	return true
}

function checkGenderValid(gender) {
	if (GENDERS.indexOf(gender) == -1)
		return false
	return true
}

function checkDateValid(dateString) {
	// Allow ISO 8601 format
	const date = new Date(dateString);

	// Check if the date is valid
	if (isNaN(date.getTime())) {
		return false;
	}
	return true;
}

module.exports = {
	validateInputs
}