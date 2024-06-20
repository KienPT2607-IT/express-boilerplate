require("dotenv").config();

const {
   validateNewProductInputs,
   addNewProduct
} = require("../services/ProductServices")

exports.addProduct = async (req, res) => {
   const { name, price, quantity, categories, description } = req.body
   try {

      const validateResult = validateNewProductInputs(
         name, price, quantity, categories, description
      )
      const addNewProductResult = addNewProduct(
         name, 
         price, 
         quantity, 
         categories, 
         description, 
         req.file.originalname
      )
      if (!validateResult)
         return res.status(400).json({
            success: false,

         })
   } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).json({
         success: false,
         message: "Database query error",
         error: error.message,
      });
   }
}