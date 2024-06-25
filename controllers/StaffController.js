require("dotenv").config();

const {
   validateLoginInputs,
   getStaffAccount,
   generateAuthToken,
   isPasswordMatched,
   logoutUser
} = require("../services/AccountServices");

exports.login = async (req, res) => {
   const { email, password } = req.body;
   try {
      const accountValidationResult = validateLoginInputs(email, password)
      if (!accountValidationResult)
         return res.status(400).json({
            success: accountValidationResult,
            message: "Invalid account!"
         })
      const staffAccount = await getStaffAccount(email, password)
      if (!staffAccount)
         return res.status(404).json({
            success: false,
            message: "This account does not exist!"
         })
      const isPassMatched = await isPasswordMatched(password, staffAccount.password)
      if (!isPassMatched)
         return res.status(400).json({
            success: false,
            message: "Invalid password",
         });
      console.log(staffAccount);
      const token = generateAuthToken(staffAccount.id, staffAccount.role);
      return res.status(200).json({
         success: true,
         message: "Logged in successfully",
         data: {
            auth_token: token,
            name: (staffAccount.email.split("@"))[0]
         }
      })
   } catch (error) {
      console.log(error);
      return res.status(500).json({
         success: false,
         message: "Database query error",
         error: error.message,
      });
   }
}


exports.logout = async (req, res) => {
   try {
      const result = await logoutUser(req.auth_token)
      if (!result) return res.status(500).json({
         success: result,
         message: "Server error, cannot invalidate token!"
      })
      return res.status(200).json({
         success: result,
         message: "Logged out successfully!"
      })
   } catch (error) {
      return res.status(500).json({
         success: result,
         message: "Server error!"
      })
   }
}