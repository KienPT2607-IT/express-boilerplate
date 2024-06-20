const connection = require("../services/DBServices");
const {
   checkNameValid,
   checkPriceValid,
   checkQuantityValid,
   checkDesValid,
   checkCategoriesValid,
} = require("../utils/product_utils")

/**
 * The function checks for the validation of the product details 
 * right after when its data received 
 * @param {string} name - The name of the product
 * @param {string} price - The price of th product
 * @param {string} quantity - The quantity of the product
 * @param {Array<string>} categories - The array of category ids
 * @param {string | undefined} description - The description of the product
 * @returns 
 */
function validateNewProductInputs(name, price, quantity, categories, description) {
   if (!checkNameValid(name)) return false
   if (!checkPriceValid(price)) return false
   if (!checkQuantityValid(quantity)) false
   if (!checkDesValid(description)) false
   if (!checkCategoriesValid(categories)) false
   return true
}

async function addNewProduct(name, price, quantity, categories, description, image_path) {
   try {
      // transform data into correct datatype
      price = parseFloat(price)
      console.log("aaaa");
      quantity = parseInt(quantity, 10)
      // Add product
      console.log("aaaa");
      const addProductPromise = await connection.query(
         "INSERT INTO products (name, price, quantity, description, image_path) VALUES (?, ?, ?, ?, ?)",
         [name, price, quantity, description, image_path]
      )
      console.log(addProductPromise);
      // categories.forEach(each => {
      //    each = parseInt(each, 10)
      // });
      // const addProductCategoryPromise = 
      // Add categories

      // Waiting for both success otherwise return error
      console.log("aaaa");
   } catch (error) {
      console.log(error);
   }
}

module.exports = {
   validateNewProductInputs,
   addNewProduct
}