const fs = require("fs");
const path = require("path");
const util = require("util");
const unlink = util.promisify(fs.unlink);
const { UPLOADS_BASE_PATH } = require("../utils/constants")

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

module.exports = { removeUploadFile }