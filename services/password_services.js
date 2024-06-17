function checkPasswordsValid(password) {
   if (
      password.length < 8
      || password.length > 16
      || password.includes(" ")
   ) return false
   return true
}

function checkPasswordConfirmValid(confirmPassword) {
   if (password !== confirmPassword) return false
   return true
}
module.exports = {
   checkPasswordsValid,
   checkPasswordConfirmValid
}