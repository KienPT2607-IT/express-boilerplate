const express = require('express');
const router = express.Router();

const { isAuth, authenticateToken } = require("../middlewares/auth");
const { uploadProductImage } = require("../middlewares/upload")
const { } = require("../services/ProductServices")
const productController = require("../controllers/ProductController")
const multer = require('multer');
const path = require('path');
const ADMIN_ROLE = "admin"

/**
 * @swagger
 * /products/add:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     description: Add a new product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: auth_token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token for authentication - only admin can to this
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Star-war the fallen start
 *               price:
 *                 type: string
 *                 example: 16.7
 *               quantity:
 *                 type: string
 *                 example: 160
 *               category_ids:
 *                 type: array
 *                 items: 
 *                   types: integer
 *                 example: [2, 9]
 *               description:
 *                 type: string
 *                 example: this is the description
 *                 required: false
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The product image to upload
 *     responses:
 *       201:
 *         description: Product added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product added
 *                 product_id:
 *                   type: integer
 *                   example: 71
 *       400:
 *         description: Product added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Error message
 *       500:
 *         description: Error when executing query
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Database query error
 *                 error:
 *                   type: string
 *                   example: The error message
 */
router.post(
   "/add",
   authenticateToken,
   isAuth([ADMIN_ROLE]),
   uploadProductImage("products", "image"),
   productController.addProduct
)

module.exports = router