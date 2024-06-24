require("dotenv").config();
const {
   validateNewProductInputs,
   addNewProduct
} = require("../services/ProductServices")
const { removeUploadFile } = require("../utils/file_utils")

exports.addProduct = async (req, res) => {
   const { name, price, quantity, category_ids, description } = req.body
   try {
      
      // * Validate the data of the product to be inserted
      const validateResult = validateNewProductInputs(
         name, price, quantity, category_ids, description
      )
      if (!validateResult.success)
         return res.status(400).json(validateResult)

      // * Insert the product into db
      const addNewProductResult = await addNewProduct(
         name,
         price,
         quantity,
         description,
         req.file.filename,
         category_ids
      )

      // * If the product is unable to inserted, remove the image just uploaded
      if (!addNewProductResult.success) {
         removeUploadFile(req.file.filename, "products")
         return res.status(400).json(addNewProductResult)
      }
      return res.status(201).json(addNewProductResult)
   } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).json({
         success: false,
         message: "Database query error",
         error: error.message,
      });
   }
}