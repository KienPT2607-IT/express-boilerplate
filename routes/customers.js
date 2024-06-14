const express = require("express");
const router = express.Router();

const customerController = require("../controllers/customer_controller");
const { isCustomer } = require("../middlewares/auth");

router.get("/", customerController.getAllUsers);

router.post("/register", customerController.register);

router.post("/login", customerController.login)

module.exports = router;
