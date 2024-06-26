const multer = require('multer');
const {v4: uuidv4} = require('uuid');
const path = require('path');
const fs = require('fs');

const { UPLOADS_BASE_PATH } = require("../utils/constants")

const createStorage = (desFolder) => multer.diskStorage({
      destination: async (req, res, callback) => {
         const desPath = path.join(UPLOADS_BASE_PATH, desFolder)
         if (!fs.existsSync(desPath)) 
            fs.mkdirSync(desPath, {recursive: true})
         callback(null, desPath)
      },
      filename: (req, file, callback) => {
         const uniqueFileName = `${uuidv4()}${Date.now()}${path.extname(file.originalname)}`
         callback(null, uniqueFileName)
      }
   })

function isFileImage(req, file, cb) {
   const filetypes = /jpeg|jpg|png/
   const extName = filetypes.test(
      path.extname(
         file.originalname
      ).toLowerCase()
   )
   const mimetype = filetypes.test(file.mimetype);

   if (mimetype && extName) {
      return cb(null, true);
   } else {
      cb(
         `Error: File upload only supports the following filetypes -${filetypes}`
      );
   }
}

function uploadProductImage(desFolder, field) {
   const storage = createStorage(desFolder)
   const upload = multer({
      storage: storage,
      limits: { fieldSize: 1024 * 1024 * 5 },
      fileFilter: isFileImage
   })
   return upload.single(field)
}

module.exports = { uploadProductImage }