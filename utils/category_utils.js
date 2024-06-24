/**
 * This function checks if the name is valid string
 * @param {string} name - name for the category
 * @returns If the name is valid
 */
function checkNameValid(name) {
   if (!name)
      return false
   if (typeof name !== "string")
      return false
   if (name.length < 2 || name.length > 100)
      return false
   return true
}

/**
 * This function checks if the description is either undefine or string
 * - undefine: not provided
 * - string: must not be empty
 * @param {string} description - description for the category
 * @returns If the description is valid
 */
function checkDesValid(description) {
   if (typeof description === "undefined")
      return true
   if (typeof description !== "string")
      return false
   if (!description.trim())
      return false
   return true
}

/**
 * This function checks if the id is either string or number
 * - string: must contain only number
 * - number: must be integer
 * @param {int | string} id - id of the category
 * @returns If the id is in valid format
 */
function isIdValid(id) {
   if (typeof id === "number") {
      if (Number.isInteger(id) && id > 0) return true
      return false
   } 
   if (typeof id === "string") {
      const intRegex = /^\d+$/;
      if (intRegex.test(id)) return true
      return false
   }
   return false
}

module.exports = {
   isIdValid,
   checkNameValid,
   checkDesValid
}