const express = require('express');
const router = express.Router();

const { isAuth, authenticateToken } = require("../middlewares/auth");
const { uploadProductImage } = require("../middlewares/upload");
const productController = require("../controllers/ProductController");
const ADMIN_ROLE = "admin", STAFF_ROLE = "staff", CUSTOMER_ROLE = "customer";

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
 *         description: Client error!
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
);

/**
 * @swagger
 * /products/:
 *   get:
 *     summary: Retrieve the products
 *     tags: [Products]
 *     description: Retrieve the products for viewing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: auth_token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token for authentication
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         required: true
 *         description: Page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         required: true
 *         description: Number of items per page (default is 10, max is 100)
 *       - in: query
 *         name: textQuery
 *         schema:
 *           type: string
 *         description: The search string which will be used to perform relatively search on products name
 *       - in: query
 *         name: relatedToProduct
 *         schema:
 *           type: integer
 *         description: The product id which will use to get related products based on it
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Filter products by category ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, name, price, like_count]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: The list of products found
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
 *                 total_products:
 *                   type: integer
 *                   example: 10
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Lego Ninja Go
 *                       price:
 *                         type: double
 *                         example: 145.8
 *                       quantity:
 *                         type: integer
 *                         example: 134
 *                       description:
 *                         type: string
 *                         example: This is the description
 *                       like_count:
 *                         type: integer
 *                         example: 1
 *                       dislike_count:
 *                         type: integer
 *                         example: 1
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: Ninja-Go ss1
 *                       image_path:
 *                         type: string
 *                         example: http:/localhost:3000/products/71guL0VnKiL._AC_SL1024_.jpg
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Lego Ninja Go
 *                       total_product:
 *                         type: integer
 *                         example: 145
 *       400:
 *         description: Client error
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
 *                   example: Error message!
 *       404:
 *         description: No products found in DB
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
 *                   example: No products found!
 *       500:
 *         description: Server error
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
 *                   example: Server error!
 *                 error:
 *                   type: string
 *                   example: The error message
 */
router.get(
   "/",
   authenticateToken,
   isAuth([CUSTOMER_ROLE]),
   productController.getListProductsForCustomer
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Retrieve the products
 *     tags: [Products]
 *     description: Retrieve the products for viewing
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: auth_token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token for authentication
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product id to view detail
 *     responses:
 *       200:
 *         description: The list of products found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Lego Ninja Go
 *                       price:
 *                         type: double
 *                         example: 145.8
 *                       quantity:
 *                         type: integer
 *                         example: 134
 *                       description:
 *                         type: string
 *                         example: This is the description
 *                       like_count:
 *                         type: integer
 *                         example: 1
 *                       image_path:
 *                         type: string
 *                         example: http:/localhost:3000/products/71guL0VnKiL._AC_SL1024_.jpg
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 1
 *                             name:
 *                               type: string
 *                               example: Ninja-Go ss1
 *       400:
 *         description: Client error
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
 *                   example: Error message!
 *       404:
 *         description: No such product found in DB
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
 *                   example: Product not found!
 *       500:
 *         description: Server error
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
 *                   example: Server error!
 *                 error:
 *                   type: string
 *                   example: The error message
 */
router.get(
   "/:id",
   authenticateToken,
   isAuth([CUSTOMER_ROLE]),
   productController.getProductDetail
);

module.exports = router;