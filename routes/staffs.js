const express = require("express");
const router = express.Router();

const staffController = require("../controllers/staff_controller");
// const { } = require("../middlewares/auth");

router.post("/login", staffController.login)

module.exports = router