const express = require('express');
const router = express.Router();

const { isStaff, isCustomer } = require("../middlewares/auth");
const { uploadProductImage } = require("../middlewares/upload")
const { } = require("../services/ProductServices")
const productController = require("../controllers/ProductController")
const multer = require('multer');
const path = require('path');

// Set up storage configuration for Multer
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, 'uploads/');
   },
   filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Append extension
   }
});

const upload = multer({
   storage: storage,
   fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

      if (mimetype && extname) {
         return cb(null, true);
      } else {
         cb(new Error('Only .jpeg, .jpg and .png files are allowed!'));
      }
   }
});

router.post(
   "/add",
   isStaff("staff"),
   uploadProductImage("products", "image"),
   // upload.single("image"),
   productController.addProduct
)

module.exports = router