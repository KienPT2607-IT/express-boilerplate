const numberRegex = /^\d+$/;
/**
 * This function checks for product's name validation
 * The name length must be in range of 10 to 100 characters
 * @param {string} name - name of the product
 * @returns If the product name is valid
 */
function checkNameValid(name) {
   if (!name) return false;
   if (typeof name !== "string") return false;
   if (
      name.length < 10
      || name.length > 100
   ) return false;
   return true;
}

/**
 * The function check if the product price is number
 * - if the price is integer, maximum length can be 8 digits
 * - if the price is float, maximum length of whole number part is 8 digits
 * and the fractional part is 2 digits 
 * @param {string} price 
 * @returns If the product price id valid
 */
function checkPriceValid(price) {
   if (!price.trim()) return false;
   // Check if the number is float
   if (price.includes(".")) {
      // Check for float with maximum of 2 digits after the decimal point and total length of 8
      const floatRegex = /^\d{1,8}\.\d{1,2}$/;
      if (floatRegex.test(price)) return true;
      return false;
   }
   // Check for integer with maximum length of 8
   const intRegex = /^\d{1,8}$/;
   if (intRegex.test(price)) return true;
   return false;
}

/**
 * This function checks if the product's quantity is valid 
 * @param {number} quantity - The quantity of the product
 * @returns If the quantity is valid
 */
function checkQuantityValid(quantity) {
   if (!numberRegex.test(quantity)) return false;

   quantity = parseInt(quantity, 10);
   if (quantity < 0) return false;
   if (quantity % 1 != 0) return false;
   return true;
}

/**
 * This function checks for product's description validation
 * The description can be either string with any length or undefined (Not provided)
 * @param {string | undefined} description 
 * @returns If the product description is valid
 */
function checkDesValid(description) {
   if (typeof description === "undefined")
      return true;
   if (typeof description !== "string")
      return false;
   if (!description.trim())
      return false;
   return true;
}

/**
 * This function checks validation for all the ids of categories 
 * that are going to be marked with product  
 * @param {Array<string>} category_ids - An array of category ids
 * @returns If all the category ids are valid
 */
function checkCategoryIdsValid(category_ids) {
   if (!category_ids) return false;
   category_ids.forEach(each => {
      if (!numberRegex.test(each)) return false;
      each = parseInt(each, 10);
      if (each <= 0) return false;
      if (each % 1 != 0) return false;
   });
   const categoryIdsSet = new Set(category_ids);
   if (categoryIdsSet.size != category_ids.length) return false;
   return true;
}

/**
 * This function transforms all the categories of products from string
 * into the array of category object which hold id-name pairs of categories
 * @param {Array<object>} products - list of products retrieved from DB
 */
function processCategories(products) {
   products.forEach(each => {
      each.price = parseFloat(each.price);
      if (!each.categories.includes(",")) {
         const [id, name] = each.categories.split(":");
         each.categories = [{ id, name }];
      } else {
         each.categories = each.categories.split(",").map(category => {
            const [id, name] = category.split(":");
            return { id, name };
         });
      }
   });
   return products;
}

/**
 * This function checks if the page number in the request query parameter is valid for doing pagination
 * @param {string | undefined} page - This is the page number to be checked for validity
 * @returns If the page number is valid along with the message if has error
 */
function checkPageNumberValid(page) {
   page = parseInt(page, 10);
   if (page === NaN) return {
      success: false,
      message: "Page number is not a number, given NaN!"
   };
   if (page <= 0) return {
      success: false,
      message: `Page number cannot be less than 1, given ${page}!`
   };
   return { success: true };
}

/**
 * This function checks if the limit number of products in the request query parameter is valid for pagination
 * @param {string} limit - This is the limitation of product quantity list to be checked for validity
 * @returns If the limit number is valid along with the message if has error
 */
function checkProductLimitNumberValid(limit) {
   limit = parseInt(limit, 10);
   if (limit === NaN) return {
      success: false,
      message: `Product limit quantity is not a number, given NaN!`
   };
   if (limit <= 0) return {
      success: false,
      message: `Product limit quantity cannot be less than 1, given ${limit}`
   };
   return { success: true };
}

/**
 * This function checks if the product sort option is valid
 * @param {string | undefined} sortBy - The product sort option
 * @returns If the product sort option is valid along with the message if has error
 */
function checkSortOptionValid(sortBy) {
   if (typeof sortBy === "undefined") return {
      success: false,
      message: `Sort option is invalid, given ${sortBy}!`
   };
   return { success: true };
}

/**
 * This function checks if the product sort order is valid
 * @param {string | undefined} sortOrder - The product sort order
 * @returns If the product sort order is valid along with the message if has error
 */
function checkSortOrderValid(sortOrder) {
   if (typeof sortOrder === "undefined"
      || (sortOrder.toUpperCase() !== "DESC"
         && sortOrder.toUpperCase() !== "ASC")
   ) return {
      success: false,
      message: `Sort order is invalid, given ${sortOrder}!`
   };
   return { success: true };
}

/**
 * This function checks if the product id is valid
 * @param {string} id - The id of product to get detail
 * @returns If the id is valid
 */
function isIdValid(id) {
   if (typeof id === "string") {
      const intRegex = /^\d+$/;
      if (intRegex.test(id)) return true;
      return false;
   }
   return false;
}

module.exports = {
   checkNameValid,
   checkDesValid,
   checkPriceValid,
   checkQuantityValid,
   checkCategoryIdsValid,
   processCategories,
   checkPageNumberValid,
   checkProductLimitNumberValid,
   checkSortOptionValid,
   checkSortOrderValid,
   isIdValid,
};