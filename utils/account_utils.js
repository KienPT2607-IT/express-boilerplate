const GENDERS = ["male", "female", "other"]

/**
 * 
 * @param {string} email 
 * @returns {boolean} 
 */
exports.checkEmailValid = (email) => {
   const emailRegex = /^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/;
   return emailRegex.test(email);
}

exports.checkPasswordsValid = (password) => {
   if (
      password.length < 8
      || password.length > 16
      || password.includes(" ")
   ) return false
   return true
}

exports.checkPasswordConfirmValid = (password, confirmPassword) => {
   if (password !== confirmPassword) return false
   return true
}

exports.checkGenderValid = (gender) => {
   if (GENDERS.indexOf(gender) == -1)
      return false
   return true
}

exports.checkDateValid = (dateString) => {
   // Allow ISO 8601 format
   const date = new Date(dateString);

   // Check if the date is valid
   if (isNaN(date.getTime())) {
      return false;
   }
   return true;
}
