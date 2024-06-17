/**
 * 
 * @param {string} email 
 * @returns {boolean} 
 */
function checkEmailValid(email) {
   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   return emailRegex.test(email);
}

module.exports = { checkEmailValid }