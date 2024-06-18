require("dotenv").config();

const connection = require("../services/db");
const { validateInput } = require("../services/category_services")

exports.addCategory = async (req, res) => {
   try {
      const { name, description } = req.body;

      const validateResult = validateInput(name, description)
      if (!validateResult.success)
         return res.status(400).json(validateResult)

      const [result] = await connection.query(
         "INSERT INTO categories (name, description) values (?,?)",
         [name.trim(), description ? description.trim() : null]
      )
      return res.status(201).json({
         success: true,
         message: "Category added",
         category_id: result.insertId
      });
   } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).json({
         success: false,
         message: "Database query error",
         error: error.message,
      });
   }
}

exports.getAllCategories = async (req, res) => {
   try {
      const [results] = await connection.query(
         "SELECT * FROM categories"
      )
      results.forEach((each) => each.is_active = each.is_active === 1)
      return res.status(200).json({
         success: true,
         data: results
      })
   } catch (error) {
      console.error("Error executing query:", error);
      return res.status(500).json({
         success: false,
         message: "Database query error",
         error: error.message,
      });
   }
}