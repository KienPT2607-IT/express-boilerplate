/**
 * 
 * @param {string} name 
 * @param {string} description 
 */
function validateInput(name, description) {
   if (!checkNameValid(name))
      return {
         success: false,
         message: "Invalid name"
      }
   if (!checkDesValid(description))
      return {
         success: false,
         message: "Invalid description"
      }
   return { success: true }
}

/**
 * 
 * @param {string} name 
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
 * 
 * @param {string} description 
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



module.exports = { validateInput }