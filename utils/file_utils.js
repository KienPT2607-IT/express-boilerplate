require("dotenv").config()
const fs = require("fs");
const path = require("path");
const util = require("util");
const unlink = util.promisify(fs.unlink);
const { UPLOADS_BASE_PATH } = require("../utils/constants");

/**
 * This function removes the uploaded file from the server's folder structure
 * @param {string} filePath - the path of the uploaded file
 * @param {string} dirPath - the path of the directory where the file is stored
 */
async function removeUploadFile(filePath, dirPath) {
   try {
      const pathToFile = `${UPLOADS_BASE_PATH}/${dirPath}/${filePath}`;
      await unlink(pathToFile);
   } catch (error) { }
}

/**
 * This function takes an array of products 
 * then process their image path for client access
 * @param {Array<object>} products - the list of product retrieved from DB
 */
function serverProductImagePaths(products) {
   products.forEach(each => {
      each.image_path = path.join(
         process.env.SERVER_URL,
         `/products`,
         each.image_path
      );
   });
   return products;
}

module.exports = {
   removeUploadFile,
   serverProductImagePaths
};