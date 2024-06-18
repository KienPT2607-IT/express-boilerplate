require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const connection = require("../services/db");
const { validateLoginInputs } = require("../services/account_services");

exports.login = async (req, res) => {
   try {
      const { email, password } = req.body;
      const validationResult = validateLoginInputs(email, password)
      if (!validationResult.success)
         return res.status(400).json(validationResult);
      const [result] = await connection.query(
         "SELECT id, role, password, email FROM staffs WHERE email = ? LIMIT 1",
         [email]
      );
      if (result.length == 0)
         return res.status(404).json({
            success: false,
            message: "This account does not exist"
         })

      console.log(result);
      const isPassMatched = await bcrypt.compare(password, result[0].password);
      if (!isPassMatched)
         return res.status(400).json({
            success: false,
            message: "Invalid password",
         });
      const token = jwt.sign({ id: result[0].id, role: result[0].role }, process.env.JWT_SECRET_KEY);
      return res.status(200).json({
         success: true,
         message: "Logged in successfully",
         data: {
            token: token,
            name: (result[0].email.split("@"))[0] 
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