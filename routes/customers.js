const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customer_controller");
const { isCustomer } = require("../middlewares/auth");

/**
 * @swagger
 * /customers/:
 *   get:
 *     summary: Retrieve all customers
 *     tags: [Customers]
 *     description: Retrieve a list of customer information data
 *     responses:
 *       200:
 *         description: A list of customer information data
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
 *                       email:
 *                         type: string
 *                         example: nichols@example.com
 *                       gender:
 *                         type: string
 *                         example: male
 *                       dob:
 *                         type: string
 *                         example: 2024-06-14T09:37:49.000Z
 *                       phone_number:
 *                         type: string
 *                         example: 0123456789
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
router.get("/", customerController.getAllUsers);

/**
 * @swagger
 * /customers/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Customers]
 *     description: Register a new user with the provided details
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: P@ssw0rd
 *               confirm_password:
 *                 type: string
 *                 format: password
 *                 example: P@ssw0rd
 *               phone_number:
 *                 type: string
 *                 example: 0123456789
 *               gender:
 *                 type: string
 *                 example: male
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: 2024-06-14T09:37:49.000Z
 *     responses:
 *       201:
 *         description: Error when executing query
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
 *                   example: Some fields duplicated
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
 *                   example: Some fields duplicated
 *                 error:
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
 *                   example: Error message
 */
router.post("/register", customerController.register);


router.post("/login", customerController.login)

module.exports = router;
