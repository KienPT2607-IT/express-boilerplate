const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/CategoryController")
const { isStaff, authenticateToken } = require("../middlewares/auth");
const { route } = require("./products");
const ADMIN_ROLE = "admin"
const STAFF_ROLE = "staff"
/**
 * @swagger
 * /categories/:
 *   get:
 *     summary: Retrieve all active categories
 *     tags: [Categories]
 *     description: Retrieve a list of categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: auth_token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token for authentication - only staff can do this
 *     responses:
 *       200:
 *         description: A list of categories
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
 *                         example: Lord of the Rings
 *                       description:
 *                         type: string
 *                         example: Build and recreate iconic moments from Middle-earth
 *                       create_at:
 *                         type: string
 *                         example: 2024-06-14T09:37:49.000Z
 *                       modify_at:
 *                         type: string
 *                         example: 2024-06-14T09:37:49.000Z
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
 *                   example: The message informs to user
 *                 error:
 *                   type: string
 *                   example: The error message
 */
router.get("/", authenticateToken, isStaff([STAFF_ROLE, ADMIN_ROLE]), categoryController.getAllCategories)

/**
 * @swagger
 * /categories/add:
 *   post:
 *     summary: Add a new category
 *     tags: [Categories]
 *     description: Add a new category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: auth_token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token for authentication - only staff can to this
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Star-war
 *               description:
 *                 type: string
 *                 example: this is the description
 *                 required: false
 *     responses:
 *       201:
 *         description: Category added successfully
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
 *                   example: Category added
 *                 category_id:
 *                   type: integer
 *                   example: 71
 *       400:
 *         description: Category added successfully
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
router.post("/add", authenticateToken, isStaff([ADMIN_ROLE]), categoryController.addCategory)

/**
 * @swagger
 * /categories/update/{id}:
 *   put:
 *     summary: Update category 
 *     tags: [Categories]
 *     description: Update a category corresponding to the provided id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the category
 *       - in: header
 *         name: auth_token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token for authentication - only admin can to this
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: Star-war
 *               description:
 *                 type: string
 *                 example: this is the description
 *                 required: false
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *                   example: Category updated!
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
 *                   example: Invalid name
 *       500:
 *         description: Error when executing query or server error
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
router.put("/update/:id", authenticateToken, isStaff([ADMIN_ROLE]), categoryController.updateCategory)

/**
 * @swagger
 * /categories/disable/{id}:
 *   put:
 *     summary: Deactivate a category 
 *     tags: [Categories]
 *     description: Deactivate a category corresponding to the provided id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the category
 *       - in: header
 *         name: auth_token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token for authentication - only admin can to this
 *     responses:
 *       200:
 *         description: Category disabled!
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
 *                   example: Category is disable!
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
 *                   example: Category is already disabled!
 *       500:
 *         description: Error when executing query or server error
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
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: The error message
 */
router.put("/disable/:id", authenticateToken, isStaff([ADMIN_ROLE]), categoryController.disableCategory)

/**
 * @swagger
 * /categories/enable/{id}:
 *   put:
 *     summary: Activate a category 
 *     tags: [Categories]
 *     description: Activate a category corresponding to the provided id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the category
 *       - in: header
 *         name: auth_token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token for authentication - only admin can to this
 *     responses:
 *       200:
 *         description: Category enabled!
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
 *                   example: Category is enabled!
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
 *                   example: Category is already enabled!
 *       500:
 *         description: Error when executing query or server error
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
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: The error message
 */
router.put("/enable/:id", authenticateToken, isStaff([ADMIN_ROLE]), categoryController.enableCategory)


module.exports = router