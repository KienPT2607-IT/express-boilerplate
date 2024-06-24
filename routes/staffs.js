const express = require("express");
const router = express.Router();

const staffController = require("../controllers/StaffController");
const { authenticateToken } = require("../middlewares/auth");

/**
 * @swagger
 * /staffs/login:
 *   post:
 *     summary: User login with own account
 *     tags: [Staffs]
 *     description: Authenticate and Log user in with the provided account
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@gmail.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 012345678
 *     responses:
 *       200:
 *         description: Logged in successfully
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
 *                   example: Logged in successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: staff
 *                     token: 
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzE4NjgyNjU2fQ.d0bcKUIeZUeOv05E0yYz_cqMEkLi16zIzsuGo8HvnQw
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
router.post("/login", staffController.login)

/**
 * @swagger
 * /staffs/logout:
 *   get:
 *     summary: Logout staff account
 *     tags: [Staffs]
 *     description: Logout staff account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: auth_token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token for authentication and invalidation checking
 *     responses:
 *       200:
 *         description: Status code represents that account logged out
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
 *                   example: Logged out successfully!
 *                     
 *       500:
 *         description: Logging out or server error
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
 *                   example: Server error, cannot invalidate token!
 *                 error:
 *                   type: string
 *                   example: The error message
 */
router.get("/logout", authenticateToken, staffController.logout)

module.exports = router