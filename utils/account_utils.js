const GENDERS = ["male", "female", "other"];

/**
 * This function checks if the user email is a valid email
 * @param {string} email - the email to be checked
 * @returns If the email is valid
 */
exports.checkEmailValid = (email) => {
	const emailRegex = /^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/;
	return emailRegex.test(email);
};

/**
 * This function checks if the user password is in valid format
 * @param {string} password - the raw password to be checked
 * @returns If the password is valid
 */
exports.checkPasswordsValid = (password) => {
	if (password.length < 8 || password.length > 16 || password.includes(" "))
		return false;
	return true;
};

/**
 * This functions checks if both password and confirmation are matched
 * @param {string} password - the account password
 * @param {string} confirmPassword - the password confirmation
 * @returns If both password and confirmation are matched
 */
exports.checkPasswordConfirmValid = (password, confirmPassword) => {
	if (password !== confirmPassword) return false;
	return true;
};

/**
 * This function checks for the validation of gender.
 * Only those followings are allowed:
 * - male
 * - female
 * - other
 * @param {string} gender - the gender of user in string format
 * @returns If the gender is allowed
 */
exports.checkGenderValid = (gender) => {
	if (GENDERS.indexOf(gender) == -1) return false;
	return true;
};

/**
 * Check if the dob is invalid format.
 * Only date in ISO 8601 string is allowed
 * @param {string} dateString - the dob is in string format
 * @returns If the string is valid
 */
exports.checkDateValid = (dateString) => {
	// Allow ISO 8601 format
	const date = new Date(dateString);

	// Check if the date is valid
	if (isNaN(date.getTime())) {
		return false;
	}
	return true;
};
