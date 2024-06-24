require("dotenv").config();

const connection = require("../services/DBServices");
const {
   validateInput,
   insertCategory,
   getAllActiveCategories,
   checkCategoryExists,
   updateCategory,
   checkIdValid,
   disableCategory,
   enableCategory,
} = require("../services/CategoryServices");

exports.addCategory = async (req, res) => {
   try {
      const { name, description } = req.body;

      const validationResult = validateInput(name, description)
      if (!validationResult.success)
         return res.status(400).json(validationResult)

      const insertResult = await insertCategory(name, description)
      if (!insertResult.success)
         return res.status(500).json(insertResult)

      insertResult.message = "Category inserted successfully!"
      return res.status(201).json(insertResult);
   } catch (error) {
      res.status(500).json({
         success: false,
         message: "Server error!",
         error: error.message,
      });
   }
}

exports.getAllCategories = async (req, res) => {
   try {
      const result = await getAllActiveCategories()
      if (!result.success) res.status(500).json(result)

      return res.status(200).json(result)
   } catch (error) {
      console.error(error);
      return res.status(500).json({
         success: false,
         message: "Server error!",
         error: error.message,
      });
   }
}

exports.updateCategory = async (req, res) => {
   try {
      // * Check if the id is positive number or sting in number format
      let validationResult = checkIdValid(req.params.id)
      if (!validationResult.success)
         return res.status(400).json(validationResult)

      // * check if there is a category corresponding to id
      validationResult = await checkCategoryExists(req.params.id)
      if (!validationResult.success) {
         const statusCode = validationResult.error ? 500 : 404
         return res.status(statusCode).json(validationResult)
      }

      const { name, description } = req.body
      validationResult = validateInput(name, description)

      if (!validationResult.success)
         return res.status(400).json(validationResult)

      const queryResult = await updateCategory(req.params.id, name, description)
      if (!queryResult.success) {
         const statusCode = queryResult.error ? 500 : 400
         return res.status(statusCode).json(queryResult)
      }
      return res.status(200).json(queryResult)
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Server error!",
         error: error.message,
      });
   }
}

exports.disableCategory = async (req, res) => {
   try {
      // * Check if the id is positive number or sting in number format
      let validationResult = checkIdValid(req.params.id)
      if (!validationResult.success)
         return res.status(400).json(validationResult)

      // * Check if there is a category corresponding to id
      validationResult = await checkCategoryExists(req.params.id)
      if (!validationResult) {
         if (validationResult.error) return res.status(500).json(validationResult)
         return res.status(404).json(validationResult)
      }

      // * Query and check if category is disable successfully
      const queryResult = await disableCategory(req.params.id)
      if (!queryResult.success) {
         const statusCode = queryResult.error ? 500 : 400
         return res.status(statusCode).json(queryResult)
      }
      return res.status(200).json(queryResult)
   } catch (error) {
      return res.status(500).json({
         success: false,
         message: "Server error!",
         error: error.message,
      });
   }
}

exports.enableCategory = async (req, res) => {
   try {
      // * Check if the id is positive number or sting in number format
      let validationResult = checkIdValid(req.params.id)
      if (!validationResult.success)
         return res.status(400).json(validationResult)

      // * check if there is a category corresponding to id
      validationResult = await checkCategoryExists(req.params.id)


      if (!validationResult) {
         if (validationResult.error) return res.status(500).json(validationResult)
         return res.status(404).json(validationResult)
      }

      // * Query and check if category is enable successfully
      const queryResult = await enableCategory(req.params.id)
      if (!queryResult.success) {
         const statusCode = queryResult.error ? 500 : 400
         return res.status(statusCode).json(queryResult)
      }
      return res.status(200).json(queryResult)

   } catch (error) {
      console.error(error);
      return res.status(500).json({
         success: false,
         message: "Server error!",
         error: error.message,
      });
   }
}