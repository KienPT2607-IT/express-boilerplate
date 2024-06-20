// @ts-nocheck
require("dotenv").config();

const connection = require("../services/DBServices");
const { validateInput } = require("../services/CategoryServices");

exports.addCategory = async (req, res) => {
   try {
      const { name, description } = req.body;

      const validationResult = validateInput(name, description)
      if (!validationResult.success)
         return res.status(400).json(validationResult)

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

exports.updateCategory = async (req, res) => {
   try {
      // check if there is a category match with this id
      let [result] = await connection.query(
         "SELECT id FROM categories WHERE id = ? LIMIT 1",
         [req.params.categoryId]
      )
      if (!result)
         return res.status(404).json({
            success: false,
            message: "No categories found"
         })
      const { name, description } = req.body
      const validationResult = validateInput(name, description)
      if (!validationResult.success)
         return res.status(400).json(validationResult)
         [result] = await connection.query(
            "UPDATE categories SET name = ?, description = ? WHERE id = ?",
            [name, description, req.params.categoryId]
         )
      console.log(result);
      return res.status(200).json({
         success: true,
         message: "Category updated"
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