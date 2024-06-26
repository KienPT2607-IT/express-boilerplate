const {
   checkNameValid,
   checkDesValid,
   isIdValid
} = require("../utils/category_utils")
const connection = require("../services/DBServices");

/**
 * This function checks if all the information of category is valid
 * @param {string} name name of category
 * @param {string | undefined} description description of category
 * @returns If all the information of category is valid
 */
function validateInput(name, description) {
   if (!checkNameValid(name)) return {
      success: false,
      message: "Invalid category's name"
   }
   if (!checkDesValid(description)) return {
      success: false,
      message: "Invalid category's description"
   }
   return { success: true }
}

/**
 * This function inserts new category into database
 * @param {string} name name for new category
 * @param {string | undefined} description description for new category
 * @returns The category insertion result
 */
async function insertCategory(name, description) {
   try {
      const [result] = await connection.query(
         "INSERT INTO categories (name, description) VALUES (?,?)",
         [name.trim(), description ? description.trim() : null]
      )
      return {
         success: true,
         category_id: result.insertId
      }
   } catch (error) {
      return {
         success: false,
         message: "Error while executing query!",
         error: error.message
      }
   }
}

/**
 * This function gets all the active categories in the database
 * @returns The active categories exist in database
 */
async function getAllActiveCategories() {
   try {
      const [results] = await connection.query(
         "SELECT id, name, description, create_at, modify_at FROM categories WHERE is_active = 1"
      )
      if (!results) return {
         success: false,
         message: "No active categories found!"
      }
      return {
         success: true,
         message: message = `Found ${results.length} active categories!`,
         data: results
      }
   } catch (error) {
      return {
         success: false,
         message: "Error while executing query!",
         error: error.message
      }
   }
}

/**
 * This functions checks if the category exists in the database
 * @param {number | string} id - id of category
 * @returns Result if the category exists
 */
async function checkCategoryExists(id) {
   try {
      const [result] = await connection.query(
         `SELECT id FROM categories 
         WHERE id = ? AND is_active = 1
         LIMIT 1`,
         [id]
      )
      if (result.length === 0) return {
         success: false,
         message: "Category not exists or is disabled!"
      }
      return { success: true }
   } catch (error) {
      return {
         success: false,
         message: "Error while executing query!",
         error: error.message
      }
   }
}

/**
 * This functions update category with new provided data 
 * @param {number | string} id - id of category
 * @param {string} newName - new name for category
 * @param {string | undefined} newDes - new description for category
 * @returns Result of category update query 
 */
async function updateCategory(id, newName, newDes) {
   try {
      const [result] = await connection.query(
         "UPDATE categories SET name = ?, description = ? WHERE id = ?",
         [newName, newDes, id]
      )
      if (result.changedRows == 0) return {
         success: false,
         message: "Category is updated already!"
      }
      return {
         success: true,
         message: "Category updated!"
      }
   } catch (error) {
      if (error.name === "ER_DUP_ENTRY") return {
         success: false,
         message: "Duplicate category name!",
         error: error.message
      }
      return {
         success: false,
         message: "Error while executing query!",
         error: error.message
      }
   }
}

/**
 * This function checks if the category's id is valid or not
 * @param {*} id - the id received in request param
 * @returns If the id is valid and probably with the message
 */
const checkIdValid = function (id) {
   const validationResult = isIdValid(id)
   if (validationResult) return { success: true }
   return {
      success: false,
      message: "Invalid category id!"
   }
}

const disableCategory = async function (id) {
   try {
      const [result] = await connection.query(
         `UPDATE categories 
         SET is_active = NOT is_active
         WHERE id = ${id} AND is_active = 1`,
      )
      console.log(result);
      if (result.changedRows != 1 || result.affectedRows == 0) return {
         success: false,
         message: "Category is already disabled or ID not exists!"
      }
      return {
         success: true,
         message: "Category is disabled!"
      }
   } catch (error) {
      console.log(error)
      return {
         success: false,
         message: "Disable category failed!",
         error: error.message
      }
   }
}

const enableCategory = async function (id) {
   try {
      const [result] = await connection.query(
         `UPDATE categories 
         SET is_active = NOT is_active
         WHERE id = ${id} AND is_active = 0`,
      )
      if (result.changedRows != 1) return {
         success: false,
         message: "Category is already active or ID not exists!"
      }
      return {
         success: true,
         message: "Category is enabled!"
      }
   } catch (error) {
      console.log(error);
      return {
         success: false,
         message: "Enable category failed!",
         error: error.message
      }
   }
}

module.exports = {
   validateInput,
   insertCategory,
   getAllActiveCategories,
   checkCategoryExists,
   updateCategory,
   checkIdValid,
   disableCategory,
   enableCategory
}