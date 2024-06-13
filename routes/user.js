const express = require("express");
const router = express.Router();

const userController = require("../controllers/user_controllers");
const { isCustomer } = require("../middlewares/auth");

router.get("/", userController.getAllUsers());

router.post("/register", async () => {});

// router.post("/login", () => { })

module.exports = router;
