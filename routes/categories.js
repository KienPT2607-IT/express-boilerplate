const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category_controller")
const { isStaff } = require("../middlewares/auth");
const { route } = require("./products");

/**
 * @swagger
 * /categories/:
 *   get:
 *     summary: Retrieve all categories
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
 *                         example: Build and recreate iconic moments from Middle-eart
 *                       is_active:
 *                         type: boolean
 *                         example: true
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
 *                   example: Database query error
 *                 error:
 *                   type: string
 *                   example: The error message
 */
router.get("/", isStaff("staff"), categoryController.getAllCategories)


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
router.post("/add", isStaff("staff"), categoryController.addCategory)

router.put("/update/:categoryId", isStaff("staff"), categoryController.updateCategory)
module.exports = router