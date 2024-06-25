const connection = require("../services/DBServices");
const {
   checkNameValid,
   checkPriceValid,
   checkQuantityValid,
   checkDesValid,
   checkCategoryIdsValid,
} = require("../utils/product_utils")

/**
 * The function checks for the validation of the product details 
 * right after when its data received 
 * @param {string} name - The name of the product
 * @param {string} price - The price of th product
 * @param {string} quantity - The quantity of the product
 * @param {Array<string>} category_ids - The array of category ids
 * @param {string | undefined} description - The description of the product
 * @returns If the product details are valid, if not returns along with a message
 * representing which data is invalid
 */
function validateNewProductInputs(name, price, quantity, category_ids, description) {
   if (!checkNameValid(name)) return {
      success: false,
      message: "Invalid product name!"
   }
   if (!checkPriceValid(price)) return {
      success: false,
      message: "Invalid product price!"
   }
   if (!checkQuantityValid(quantity)) return {
      success: false,
      message: "Invalid product quantity!"
   }
   if (!checkDesValid(description)) return {
      success: false,
      message: "Invalid product description!"
   }
   if (!checkCategoryIdsValid(category_ids)) return {
      success: false,
      message: "Invalid product category ids!"
   }
   return { success: true }
}

/**
 * 
 * @param {string} name - The name for product
 * @param {string | number} price - The price for product, it can be string or number but must be in unsigned integer or float
 * @param {number} quantity - The quantity for the product 
 * @param {Array<string | number>} category_ids - The array ids of category where product belongs to
 * @param {string} description - The description for the product
 * @param {string} image_path - the image name of the product
 * @returns If the product is inserted successfully. If so, returns along with its id, 
 * otherwise, returns the message or/and error
 */
async function addNewProduct(name, price, quantity, description, image_path, category_ids) {
   try {
      // * Start the transaction
      await connection.beginTransaction()

      // * Execute query to insert product
      const [insertProductResult] = await connection.query(
         `INSERT INTO products (name, price, quantity, description, image_path) 
         VALUES (?, ?, ?, ?, ?)`,
         [name, price, quantity, description, image_path]
      )

      const productId = insertProductResult.insertId

      const productCategoriesValues = category_ids.map(
         category_id => [productId, category_id]
      )
      console.log(productCategoriesValues);
      await connection.query(
         `INSERT INTO product_categories (product_id, category_id) VALUES ?`,
         [productCategoriesValues]
      )

      await connection.commit()
      return {
         success: true,
         product_id: productId,
         message: "Product inserted successfully!"
      }
   } catch (error) {
      await connection.rollback()
      if (error.name === "ER_DUP_ENTRY") return {
         success: false,
         message: "Duplicate product name!",
         error: error.message
      }
      if (error.name === "ER_SIGNAL_EXCEPTION") return {
         success: false,
         message: "A category is inactive!",
         error: error.message
      }
      console.log( error);
      return {
         success: false,
         message: "Error inserting product and categories!",
         error: error.message
      }
   }
}

module.exports = {
   validateNewProductInputs,
   addNewProduct
}